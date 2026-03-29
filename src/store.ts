import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, ContentItem, AdItem, SocialPost, ContentReport, AdFeedback, User, CompanySettings } from './types';

// Device ID utility
const getDeviceId = () => {
  let deviceId = localStorage.getItem('marketplan_device_id');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('marketplan_device_id', deviceId);
  }
  return deviceId;
};

interface AppState {
  currentUser: { uid: string; email: string } | null;
  userProfile: User | null;
  isAuthReady: boolean;
  isDeviceApproved: boolean;
  
  products: Product[];
  contentItems: ContentItem[];
  adItems: AdItem[];
  socialPosts: SocialPost[];
  pastReports: ContentReport[];
  adFeedbacks: AdFeedback[];
  users: User[];
  companySettings: CompanySettings;
  
  setAuthReady: (ready: boolean) => void;
  setCurrentUser: (user: { uid: string; email: string } | null) => void;
  setUserProfile: (profile: User | null) => void;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>;
  updateContent: (id: string, content: Partial<ContentItem>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;

  addAd: (ad: Omit<AdItem, 'id' | 'createdAt'>) => Promise<void>;
  updateAd: (id: string, ad: Partial<AdItem>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;

  addAdFeedback: (feedback: Omit<AdFeedback, 'id' | 'createdAt'>) => Promise<void>;
  deleteAdFeedback: (id: string) => Promise<void>;
  toggleAdFeedbackDone: (id: string) => Promise<void>;

  addSocialPosts: (posts: Omit<SocialPost, 'id' | 'createdAt' | 'isDone'>[]) => Promise<void>;
  updateSocialPost: (id: string, post: Partial<SocialPost>) => Promise<void>;
  toggleSocialPostDone: (id: string) => Promise<void>;
  deleteSocialPost: (id: string) => Promise<void>;
  bulkToggleSocialPostDone: (ids: string[], isDone: boolean) => Promise<void>;
  bulkDeleteSocialPost: (ids: string[]) => Promise<void>;
  archiveAndClearSocialPosts: (monthName: string) => Promise<void>;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'approvedDevices' | 'pendingDevices'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  approveDevice: (userId: string, deviceId: string) => Promise<void>;
  rejectDevice: (userId: string, deviceId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  userProfile: null,
  isAuthReady: false,
  isDeviceApproved: false,
  
  products: [],
  contentItems: [],
  adItems: [],
  socialPosts: [],
  pastReports: [],
  adFeedbacks: [],
  users: [],
  companySettings: {
    name: 'MarketPlan',
  },
  
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => {
    if (profile) {
      const deviceId = getDeviceId();
      const isApproved = profile.role === 'Admin' || profile.approvedDevices.includes(deviceId);
      set({ userProfile: profile, isDeviceApproved: isApproved });
    } else {
      set({ userProfile: null, isDeviceApproved: false });
    }
  },

  login: async (email, password) => {
    try {
      // 1. Try to sign in with Firebase Auth
      let authUser;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        authUser = userCredential.user;
      } catch (authError: any) {
        // 2. If it fails, check if this is the first-time bootstrap
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty && email === 'demarkt.content@gmail.com') {
          // Bootstrap the first admin in Firebase Auth
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          authUser = userCredential.user;
          
          const deviceId = getDeviceId();
          const userData: User = {
            id: authUser.uid,
            name: 'Master Admin',
            email,
            password, // Storing for reference as requested, though not ideal
            role: 'Admin',
            approvedDevices: [deviceId],
            pendingDevices: [],
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', authUser.uid), userData);
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      }

      // 3. Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (!userDoc.exists()) {
        return { success: false, error: 'User profile not found' };
      }

      const userData = userDoc.data() as User;
      const deviceId = getDeviceId();
      
      // 4. Handle device approval
      if (userData.role !== 'Admin' && !userData.approvedDevices.includes(deviceId)) {
        if (!userData.pendingDevices.includes(deviceId)) {
          const updatedPending = [...(userData.pendingDevices || []), deviceId];
          await updateDoc(doc(db, 'users', userData.id), { pendingDevices: updatedPending });
          userData.pendingDevices = updatedPending;
        }
      }

      get().setCurrentUser({ uid: userData.id, email: userData.email });
      get().setUserProfile(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  },

  signUp: async (name, email, password) => {
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;
      
      // 2. Create the user profile in Firestore
      const deviceId = getDeviceId();
      const userData: User = {
        id: authUser.uid,
        name,
        email,
        password, // Storing for reference as requested, though not ideal
        role: 'Content Manager', // Default role for self-signups
        approvedDevices: [], // Needs approval
        pendingDevices: [deviceId],
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', authUser.uid), userData);
      
      get().setCurrentUser({ uid: userData.id, email: userData.email });
      get().setUserProfile(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      let message = 'An error occurred during signup';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already in use';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters';
      }
      return { success: false, error: message };
    }
  },

  logout: async () => {
    await signOut(auth);
    get().setCurrentUser(null);
    get().setUserProfile(null);
    set({ isAuthReady: true });
  },

  updateCompanySettings: async (settings) => {
    try {
      const newSettings = { ...get().companySettings, ...settings };
      await setDoc(doc(db, 'settings', 'company'), newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/company');
    }
  },

  addProduct: async (product) => {
    try {
      const id = uuidv4();
      const newProduct = { ...product, id, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'products', id), newProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  },
  updateProduct: async (id, updatedProduct) => {
    try {
      await updateDoc(doc(db, 'products', id), updatedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  },
  deleteProduct: async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  },
  
  addContent: async (content) => {
    try {
      const id = uuidv4();
      const newContent = { ...content, id, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'contentItems', id), newContent);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'contentItems');
    }
  },
  updateContent: async (id, updatedContent) => {
    try {
      await updateDoc(doc(db, 'contentItems', id), updatedContent);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `contentItems/${id}`);
    }
  },
  deleteContent: async (id) => {
    try {
      await deleteDoc(doc(db, 'contentItems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `contentItems/${id}`);
    }
  },
  
  addAd: async (ad) => {
    try {
      const id = uuidv4();
      const newAd = { ...ad, id, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'adItems', id), newAd);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'adItems');
    }
  },
  updateAd: async (id, updatedAd) => {
    try {
      await updateDoc(doc(db, 'adItems', id), updatedAd);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `adItems/${id}`);
    }
  },
  deleteAd: async (id) => {
    try {
      await deleteDoc(doc(db, 'adItems', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `adItems/${id}`);
    }
  },

  addAdFeedback: async (feedback) => {
    try {
      const id = uuidv4();
      const newFeedback = { ...feedback, id, isDone: false, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'adFeedbacks', id), newFeedback);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'adFeedbacks');
    }
  },
  deleteAdFeedback: async (id) => {
    try {
      await deleteDoc(doc(db, 'adFeedbacks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `adFeedbacks/${id}`);
    }
  },
  toggleAdFeedbackDone: async (id) => {
    try {
      const feedback = get().adFeedbacks.find(f => f.id === id);
      if (feedback) {
        await updateDoc(doc(db, 'adFeedbacks', id), { isDone: !feedback.isDone });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `adFeedbacks/${id}`);
    }
  },

  addSocialPosts: async (posts) => {
    try {
      for (const p of posts) {
        const id = uuidv4();
        const newPost = { ...p, id, isDone: false, createdAt: new Date().toISOString() };
        await setDoc(doc(db, 'socialPosts', id), newPost);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'socialPosts');
    }
  },
  updateSocialPost: async (id, updatedPost) => {
    try {
      await updateDoc(doc(db, 'socialPosts', id), updatedPost);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `socialPosts/${id}`);
    }
  },
  toggleSocialPostDone: async (id) => {
    try {
      const post = get().socialPosts.find(p => p.id === id);
      if (post) {
        await updateDoc(doc(db, 'socialPosts', id), { isDone: !post.isDone });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `socialPosts/${id}`);
    }
  },
  deleteSocialPost: async (id) => {
    try {
      await deleteDoc(doc(db, 'socialPosts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `socialPosts/${id}`);
    }
  },
  bulkToggleSocialPostDone: async (ids, isDone) => {
    try {
      for (const id of ids) {
        await updateDoc(doc(db, 'socialPosts', id), { isDone });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'socialPosts/bulk');
    }
  },
  bulkDeleteSocialPost: async (ids) => {
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, 'socialPosts', id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'socialPosts/bulk');
    }
  },
  archiveAndClearSocialPosts: async (monthName) => {
    try {
      const state = get();
      const total = state.socialPosts.length;
      const completed = state.socialPosts.filter(p => p.isDone).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const id = uuidv4();
      const newReport: ContentReport = {
        id,
        monthName,
        totalPosts: total,
        completedPosts: completed,
        completionRate: rate,
        archivedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'pastReports', id), newReport);
      
      // Clear current posts
      for (const post of state.socialPosts) {
        await deleteDoc(doc(db, 'socialPosts', post.id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'archive');
    }
  },

  addUser: async (user) => {
    try {
      // 1. Create the user in Firebase Auth using a secondary app instance
      // This prevents the admin from being signed out
      const secondaryApp = initializeApp(firebaseConfig, `secondary-${uuidv4()}`);
      const { getAuth: getSecondaryAuth, createUserWithEmailAndPassword: createSecondaryUser } = await import('firebase/auth');
      const secondaryAuth = getSecondaryAuth(secondaryApp);
      
      const userCredential = await createSecondaryUser(secondaryAuth, user.email, user.password);
      const authUser = userCredential.user;
      
      // 2. Create the user profile in Firestore
      const newUser: User = { 
        ...user, 
        id: authUser.uid, 
        approvedDevices: [], 
        pendingDevices: [], 
        createdAt: new Date().toISOString() 
      };
      await setDoc(doc(db, 'users', authUser.uid), newUser);
      
      // 3. Cleanup secondary app
      await deleteApp(secondaryApp);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  },
  updateUser: async (id, updatedUser) => {
    try {
      await updateDoc(doc(db, 'users', id), updatedUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${id}`);
    }
  },
  deleteUser: async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
  },
  approveDevice: async (userId, deviceId) => {
    try {
      const user = get().users.find(u => u.id === userId);
      if (user) {
        const approvedDevices = [...user.approvedDevices, deviceId];
        const pendingDevices = user.pendingDevices.filter(id => id !== deviceId);
        await updateDoc(doc(db, 'users', userId), { approvedDevices, pendingDevices });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/approve`);
    }
  },
  rejectDevice: async (userId, deviceId) => {
    try {
      const user = get().users.find(u => u.id === userId);
      if (user) {
        const pendingDevices = user.pendingDevices.filter(id => id !== deviceId);
        await updateDoc(doc(db, 'users', userId), { pendingDevices });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/reject`);
    }
  },
}));

// Initialize session persistence and Firestore sync
const initStore = async () => {
  const store = useStore.getState();
  
  onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        store.setCurrentUser({ uid: userData.id, email: userData.email });
        store.setUserProfile(userData);
        
        // Set up Firestore listeners
        const unsubscribes = [
          onSnapshot(collection(db, 'products'), (snapshot) => {
            useStore.setState({ products: snapshot.docs.map(doc => doc.data() as Product) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'products')),

          onSnapshot(collection(db, 'contentItems'), (snapshot) => {
            useStore.setState({ contentItems: snapshot.docs.map(doc => doc.data() as ContentItem) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'contentItems')),

          onSnapshot(collection(db, 'adItems'), (snapshot) => {
            useStore.setState({ adItems: snapshot.docs.map(doc => doc.data() as AdItem) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'adItems')),

          onSnapshot(collection(db, 'socialPosts'), (snapshot) => {
            useStore.setState({ socialPosts: snapshot.docs.map(doc => doc.data() as SocialPost) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'socialPosts')),

          onSnapshot(collection(db, 'pastReports'), (snapshot) => {
            useStore.setState({ pastReports: snapshot.docs.map(doc => doc.data() as ContentReport) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'pastReports')),

          onSnapshot(collection(db, 'adFeedbacks'), (snapshot) => {
            useStore.setState({ adFeedbacks: snapshot.docs.map(doc => doc.data() as AdFeedback) });
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'adFeedbacks')),

          onSnapshot(collection(db, 'users'), (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data() as User);
            useStore.setState({ users });
            
            // Update current user profile if it changed
            const currentProfile = users.find(u => u.id === authUser.uid);
            if (currentProfile) {
              store.setUserProfile(currentProfile);
            }
          }, (error) => handleFirestoreError(error, OperationType.LIST, 'users')),

          onSnapshot(doc(db, 'settings', 'company'), (doc) => {
            if (doc.exists()) {
              useStore.setState({ companySettings: doc.data() as CompanySettings });
            }
          }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/company')),
        ];
      } else {
        await signOut(auth);
        store.setAuthReady(true);
      }
    } else {
      store.setCurrentUser(null);
      store.setUserProfile(null);
      store.setAuthReady(true);
    }
    store.setAuthReady(true);
  });
};

initStore();

