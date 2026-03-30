import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Product, ContentItem, AdItem, SocialPost, ContentReport, AdFeedback, User, CompanySettings, UserPermissions, DeviceApproval, Role } from './types';

const STORAGE_KEY = 'marketplan_data';

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

const loadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return {
    products: [],
    contentItems: [],
    adItems: [],
    socialPosts: [],
    pastReports: [],
    adFeedbacks: [],
    deviceApprovals: [],
    users: [],
    roles: [],
    companySettings: { name: 'MarketPlan' }
  };
};

const saveData = (state: Partial<AppState>) => {
  const currentData = loadData();
  const newData = {
    products: state.products ?? currentData.products,
    contentItems: state.contentItems ?? currentData.contentItems,
    adItems: state.adItems ?? currentData.adItems,
    socialPosts: state.socialPosts ?? currentData.socialPosts,
    pastReports: state.pastReports ?? currentData.pastReports,
    adFeedbacks: state.adFeedbacks ?? currentData.adFeedbacks,
    deviceApprovals: state.deviceApprovals ?? currentData.deviceApprovals,
    users: state.users ?? currentData.users,
    roles: state.roles ?? currentData.roles,
    companySettings: state.companySettings ?? currentData.companySettings
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
};

export const useStore = create<AppState>((set, get) => {
  const initialData = loadData();

  return {
    currentUser: null,
    userProfile: null,
    isAuthReady: false,
    
    ...initialData,
    
    setAuthReady: (ready) => set({ isAuthReady: ready }),
    setCurrentUser: (user) => set({ currentUser: user }),
    setUserProfile: (profile) => set({ userProfile: profile }),

    login: async (email, password) => {
      const { users } = get();
      let user = users.find(u => u.email === email && u.password === password);

      if (!user && email === 'demarkt.content@gmail.com' && users.length === 0) {
        // Bootstrap admin
        const id = uuidv4();
        user = {
          id,
          name: 'Master Admin',
          email,
          password,
          role: 'Admin',
          permissions: getDefaultPermissions('Admin'),
          createdAt: new Date().toISOString()
        };
        const newUsers = [user];
        set({ users: newUsers });
        saveData({ users: newUsers });
      }

      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Device Approval Check
      if (user.role !== 'Admin') {
        let deviceId = localStorage.getItem('marketplan_device_id');
        if (!deviceId) {
          deviceId = uuidv4();
          localStorage.setItem('marketplan_device_id', deviceId);
        }

        const { deviceApprovals } = get();
        const approval = deviceApprovals.find(a => a.userId === user!.id && a.deviceId === deviceId);

        if (!approval) {
          const approvalId = uuidv4();
          const newApproval: DeviceApproval = {
            id: approvalId,
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            deviceId,
            deviceName: navigator.userAgent.includes('Mobi') ? 'Mobile Device' : 'Desktop Device',
            userAgent: navigator.userAgent,
            isApproved: false,
            createdAt: new Date().toISOString()
          };
          const newApprovals = [...deviceApprovals, newApproval];
          set({ deviceApprovals: newApprovals });
          saveData({ deviceApprovals: newApprovals });
          return { success: false, pendingApproval: true, error: 'Device pending approval from Admin' };
        } else if (!approval.isApproved) {
          return { success: false, pendingApproval: true, error: 'Device pending approval from Admin' };
        }
      }

      localStorage.setItem('marketplan_user_id', user.id);
      set({ currentUser: { uid: user.id, email: user.email }, userProfile: user });
      return { success: true };
    },

    signUp: async (name, email, password) => {
      const { users } = get();
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'This email is already in use' };
      }

      const id = uuidv4();
      const user: User = {
        id,
        name,
        email,
        password,
        role: 'Admin',
        permissions: getDefaultPermissions('Admin'),
        createdAt: new Date().toISOString()
      };
      const newUsers = [...users, user];
      set({ users: newUsers, currentUser: { uid: id, email }, userProfile: user });
      saveData({ users: newUsers });
      localStorage.setItem('marketplan_user_id', id);
      return { success: true };
    },

    logout: () => {
      localStorage.removeItem('marketplan_user_id');
      set({ currentUser: null, userProfile: null, isAuthReady: true });
    },

    updateCompanySettings: async (settings) => {
      const newSettings = { ...get().companySettings, ...settings };
      set({ companySettings: newSettings });
      saveData({ companySettings: newSettings });
    },

    approveDevice: async (id) => {
      const newApprovals = get().deviceApprovals.map(a => 
        a.id === id ? { ...a, isApproved: true } : a
      );
      set({ deviceApprovals: newApprovals });
      saveData({ deviceApprovals: newApprovals });
    },

    rejectDevice: async (id) => {
      const newApprovals = get().deviceApprovals.filter(a => a.id !== id);
      set({ deviceApprovals: newApprovals });
      saveData({ deviceApprovals: newApprovals });
    },

    addProduct: async (product) => {
      const id = uuidv4();
      const newProduct = { ...product, id, createdAt: new Date().toISOString() };
      const newProducts = [...get().products, newProduct];
      set({ products: newProducts });
      saveData({ products: newProducts });
    },
    updateProduct: async (id, updatedProduct) => {
      const newProducts = get().products.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
      set({ products: newProducts });
      saveData({ products: newProducts });
    },
    deleteProduct: async (id) => {
      const newProducts = get().products.filter(p => p.id !== id);
      set({ products: newProducts });
      saveData({ products: newProducts });
    },
    
    addContent: async (content) => {
      const id = uuidv4();
      const newContent = { ...content, id, createdAt: new Date().toISOString() };
      const newContentItems = [...get().contentItems, newContent];
      set({ contentItems: newContentItems });
      saveData({ contentItems: newContentItems });
    },
    updateContent: async (id, updatedContent) => {
      const newContentItems = get().contentItems.map(c => c.id === id ? { ...c, ...updatedContent } : c);
      set({ contentItems: newContentItems });
      saveData({ contentItems: newContentItems });
    },
    deleteContent: async (id) => {
      const newContentItems = get().contentItems.filter(c => c.id !== id);
      set({ contentItems: newContentItems });
      saveData({ contentItems: newContentItems });
    },
    
    addAd: async (ad) => {
      const id = uuidv4();
      const newAd = { ...ad, id, createdAt: new Date().toISOString() };
      const newAdItems = [...get().adItems, newAd];
      set({ adItems: newAdItems });
      saveData({ adItems: newAdItems });
    },
    updateAd: async (id, updatedAd) => {
      const newAdItems = get().adItems.map(a => a.id === id ? { ...a, ...updatedAd } : a);
      set({ adItems: newAdItems });
      saveData({ adItems: newAdItems });
    },
    deleteAd: async (id) => {
      const newAdItems = get().adItems.filter(a => a.id !== id);
      set({ adItems: newAdItems });
      saveData({ adItems: newAdItems });
    },

    addAdFeedback: async (feedback) => {
      const id = uuidv4();
      const newFeedback = { ...feedback, id, isDone: false, createdAt: new Date().toISOString() };
      const newAdFeedbacks = [...get().adFeedbacks, newFeedback];
      set({ adFeedbacks: newAdFeedbacks });
      saveData({ adFeedbacks: newAdFeedbacks });
    },
    deleteAdFeedback: async (id) => {
      const newAdFeedbacks = get().adFeedbacks.filter(f => f.id !== id);
      set({ adFeedbacks: newAdFeedbacks });
      saveData({ adFeedbacks: newAdFeedbacks });
    },
    toggleAdFeedbackDone: async (id) => {
      const newAdFeedbacks = get().adFeedbacks.map(f => f.id === id ? { ...f, isDone: !f.isDone } : f);
      set({ adFeedbacks: newAdFeedbacks });
      saveData({ adFeedbacks: newAdFeedbacks });
    },

    addSocialPosts: async (posts) => {
      const newPosts = [...get().socialPosts];
      for (const p of posts) {
        const id = uuidv4();
        newPosts.push({ ...p, id, isDone: false, createdAt: new Date().toISOString() });
      }
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    updateSocialPost: async (id, updatedPost) => {
      const newPosts = get().socialPosts.map(p => p.id === id ? { ...p, ...updatedPost } : p);
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    toggleSocialPostDone: async (id) => {
      const newPosts = get().socialPosts.map(p => p.id === id ? { ...p, isDone: !p.isDone } : p);
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    deleteSocialPost: async (id) => {
      const newPosts = get().socialPosts.filter(p => p.id !== id);
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    bulkToggleSocialPostDone: async (ids, isDone) => {
      const newPosts = get().socialPosts.map(p => ids.includes(p.id) ? { ...p, isDone } : p);
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    bulkDeleteSocialPost: async (ids) => {
      const newPosts = get().socialPosts.filter(p => !ids.includes(p.id));
      set({ socialPosts: newPosts });
      saveData({ socialPosts: newPosts });
    },
    archiveAndClearSocialPosts: async (monthName) => {
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

      const newPastReports = [...state.pastReports, newReport];
      set({ pastReports: newPastReports, socialPosts: [] });
      saveData({ pastReports: newPastReports, socialPosts: [] });
    },

    addUser: async (user) => {
      const id = uuidv4();
      const newUser: User = { 
        ...user, 
        id, 
        permissions: user.permissions || getDefaultPermissions(user.role),
        createdAt: new Date().toISOString() 
      };
      const newUsers = [...get().users, newUser];
      set({ users: newUsers });
      saveData({ users: newUsers });
    },
    updateUser: async (id, updatedUser) => {
      const newUsers = get().users.map(u => u.id === id ? { ...u, ...updatedUser } : u);
      set({ users: newUsers });
      saveData({ users: newUsers });
    },
    deleteUser: async (id) => {
      const newUsers = get().users.filter(u => u.id !== id);
      set({ users: newUsers });
      saveData({ users: newUsers });
    },

    addRole: async (role) => {
      const id = uuidv4();
      const newRole: Role = { ...role, id, createdAt: new Date().toISOString() };
      const newRoles = [...get().roles, newRole];
      set({ roles: newRoles });
      saveData({ roles: newRoles });
    },
    updateRole: async (id, updatedRole) => {
      const newRoles = get().roles.map(r => r.id === id ? { ...r, ...updatedRole } : r);
      set({ roles: newRoles });
      saveData({ roles: newRoles });
    },
    deleteRole: async (id) => {
      const newRoles = get().roles.filter(r => r.id !== id);
      set({ roles: newRoles });
      saveData({ roles: newRoles });
    },
  };
});

// Initialize session persistence
const initStore = () => {
  try {
    console.log('Initializing store...');
    const store = useStore.getState();
    const userId = localStorage.getItem('marketplan_user_id');
    
    if (userId) {
      const user = store.users.find(u => u.id === userId);
      if (user) {
        store.setCurrentUser({ uid: user.id, email: user.email });
        store.setUserProfile(user);
        console.log('User session restored:', user.email);
      } else {
        localStorage.removeItem('marketplan_user_id');
        console.log('User session invalid, cleared');
      }
    }
    store.setAuthReady(true);
    console.log('Store initialization complete');
  } catch (error) {
    console.error('Failed to initialize store:', error);
    // Still set auth ready to avoid infinite spinner if possible
    useStore.getState().setAuthReady(true);
  }
};

try {
  initStore();
} catch (error) {
  console.error('Fatal error in store initialization:', error);
}
