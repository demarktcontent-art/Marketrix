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
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, ContentItem, AdItem, SocialPost, ContentReport, AdFeedback, User, CompanySettings, UserRole, UserPermissions, DeviceApproval, Role } from './types';

const getDefaultPermissions = (role: string): UserPermissions => {
  switch (role) {
    case 'Admin':
      return {
        canManageProducts: true,
        canManageContent: true,
        canManageAds: true,
        canManageUsers: true,
        canEditSettings: true,
        canSeeBuyingPrice: true,
      };
    case 'Ads Manager':
      return {
        canManageProducts: true,
        canManageContent: true,
        canManageAds: true,
        canManageUsers: false,
        canEditSettings: false,
        canSeeBuyingPrice: false,
      };
    case 'Content Manager':
      return {
        canManageProducts: false,
        canManageContent: true,
        canManageAds: false,
        canManageUsers: false,
        canEditSettings: false,
        canSeeBuyingPrice: false,
      };
    default:
      return {
        canManageProducts: false,
        canManageContent: false,
        canManageAds: false,
        canManageUsers: false,
        canEditSettings: false,
        canSeeBuyingPrice: false,
      };
  }
};

interface AppState {
  currentUser: { uid: string; email: string } | null;
  userProfile: User | null;
  isAuthReady: boolean;
  
  products: Product[];
  contentItems: ContentItem[];
  adItems: AdItem[];
  socialPosts: SocialPost[];
  pastReports: ContentReport[];
  adFeedbacks: AdFeedback[];
  deviceApprovals: DeviceApproval[];
  users: User[];
  roles: Role[];
  companySettings: CompanySettings;
  
  setAuthReady: (ready: boolean) => void;
  setCurrentUser: (user: { uid: string; email: string } | null) => void;
  setUserProfile: (profile: User | null) => void;

  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; pendingApproval?: boolean }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;

  approveDevice: (id: string) => Promise<void>;
  rejectDevice: (id: string) => Promise<void>;

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

  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addRole: (role: Omit<Role, 'id' | 'createdAt'>) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  userProfile: null,
  isAuthReady: false,
  
  products: [],
  contentItems: [],
  adItems: [],
  socialPosts: [],
  pastReports: [],
  adFeedbacks: [],
  deviceApprovals: [],
  users: [],
  roles: [],
  companySettings: {
    name: 'MarketPlan',
  },
  
  setAuthReady: (ready) => set({ isAuthReady: ready }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserProfile: (profile) => set({ userProfile: profile }),

  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), where('password', '==', password), limit(1));
      
      let snapshot;
      try {
        snapshot = await getDocs(q);
      } catch (e) {
        console.error('Error fetching user snapshot:', e);
        throw e;
      }
      
      let userData: User;

      if (snapshot.empty) {
        console.log('User not found, checking for bootstrap...');
        // Check if this is the first-time bootstrap
        let allUsersSnapshot;
        try {
          allUsersSnapshot = await getDocs(query(usersRef, limit(1)));
        } catch (e) {
          console.error('Error fetching all users snapshot:', e);
          throw e;
        }

        if (allUsersSnapshot.empty && email === 'demarkt.content@gmail.com') {
          console.log('Bootstrapping master admin...');
          const id = uuidv4();
          userData = {
            id,
            name: 'Master Admin',
            email,
            password,
            role: 'Admin',
            permissions: getDefaultPermissions('Admin'),
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', id), userData);
          } catch (e) {
            console.error('Error setting bootstrap user doc:', e);
            throw e;
          }
        } else {
          return { success: false, error: 'Invalid email or password' };
        }
      } else {
        userData = snapshot.docs[0].data() as User;
      }

      // Device Approval Check
      if (userData.role !== 'Admin') {
        let deviceId = localStorage.getItem('marketplan_device_id');
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem('marketplan_device_id', deviceId);
        }

        const approvalsRef = collection(db, 'deviceApprovals');
        const aq = query(approvalsRef, where('userId', '==', userData.id), where('deviceId', '==', deviceId), limit(1));
        const aSnapshot = await getDocs(aq);

        if (aSnapshot.empty) {
          // Create new approval request
          const approvalId = uuidv4();
          const newApproval: DeviceApproval = {
            id: approvalId,
            userId: userData.id,
            userEmail: userData.email,
            userName: userData.name,
            deviceId,
            deviceName: navigator.userAgent.includes('Mobi') ? 'Mobile Device' : 'Desktop Device',
            userAgent: navigator.userAgent,
            isApproved: false,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'deviceApprovals', approvalId), newApproval);
          return { success: false, pendingApproval: true, error: 'Device pending approval from Admin' };
        } else {
          const approvalData = aSnapshot.docs[0].data() as DeviceApproval;
          if (!approvalData.isApproved) {
            return { success: false, pendingApproval: true, error: 'Device pending approval from Admin' };
          }
        }
      }

      localStorage.setItem('marketplan_user_id', userData.id);
      get().setCurrentUser({ uid: userData.id, email: userData.email });
      get().setUserProfile(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
      return { success: false, error: 'An error occurred during login' };
    }
  },

  signUp: async (name, email, password) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const emailCheck = await getDocs(q);
      
      if (!emailCheck.empty) {
        return { success: false, error: 'This email is already in use' };
      }

      const id = uuidv4();
      const userData: User = {
        id,
        name,
        email,
        password,
        role: 'Admin',
        permissions: getDefaultPermissions('Admin'),
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', id), userData);
      
      localStorage.setItem('marketplan_user_id', id);
      get().setCurrentUser({ uid: userData.id, email: userData.email });
      get().setUserProfile(userData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: 'An error occurred during signup' };
    }
  },

  logout: () => {
    localStorage.removeItem('marketplan_user_id');
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

  approveDevice: async (id) => {
    try {
      await updateDoc(doc(db, 'deviceApprovals', id), { isApproved: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `deviceApprovals/${id}`);
    }
  },

  rejectDevice: async (id) => {
    try {
      await deleteDoc(doc(db, 'deviceApprovals', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `deviceApprovals/${id}`);
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
      const id = uuidv4();
      const newUser: User = { 
        ...user, 
        id, 
        permissions: user.permissions || getDefaultPermissions(user.role),
        createdAt: new Date().toISOString() 
      };
      await setDoc(doc(db, 'users', id), newUser);
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

  addRole: async (role) => {
    try {
      const id = uuidv4();
      const newRole: Role = { ...role, id, createdAt: new Date().toISOString() };
      await setDoc(doc(db, 'roles', id), newRole);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'roles');
    }
  },
  updateRole: async (id, updatedRole) => {
    try {
      await updateDoc(doc(db, 'roles', id), updatedRole);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `roles/${id}`);
    }
  },
  deleteRole: async (id) => {
    try {
      await deleteDoc(doc(db, 'roles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `roles/${id}`);
    }
  },
}));

// Initialize session persistence and Firestore sync
const initStore = async () => {
  const store = useStore.getState();
  const userId = localStorage.getItem('marketplan_user_id');
  
  if (userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
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

        onSnapshot(collection(db, 'deviceApprovals'), (snapshot) => {
          useStore.setState({ deviceApprovals: snapshot.docs.map(doc => doc.data() as DeviceApproval) });
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'deviceApprovals')),

        onSnapshot(collection(db, 'roles'), (snapshot) => {
          useStore.setState({ roles: snapshot.docs.map(doc => doc.data() as Role) });
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'roles')),

        onSnapshot(collection(db, 'users'), (snapshot) => {
          const users = snapshot.docs.map(doc => doc.data() as User);
          useStore.setState({ users });
          
          // Update current user profile if it changed
          const currentProfile = users.find(u => u.id === userId);
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
      localStorage.removeItem('marketplan_user_id');
      store.setAuthReady(true);
    }
  } else {
    store.setAuthReady(true);
  }
  store.setAuthReady(true);
};

initStore();

