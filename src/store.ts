import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Product, ContentItem, AdItem, SocialPost, ContentReport, AdFeedback, User, CompanySettings } from './types';

interface AppState {
  products: Product[];
  contentItems: ContentItem[];
  adItems: AdItem[];
  socialPosts: SocialPost[];
  pastReports: ContentReport[];
  adFeedbacks: AdFeedback[];
  users: User[];
  companySettings: CompanySettings;
  
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addContent: (content: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  updateContent: (id: string, content: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;

  addAd: (ad: Omit<AdItem, 'id' | 'createdAt'>) => void;
  updateAd: (id: string, ad: Partial<AdItem>) => void;
  deleteAd: (id: string) => void;

  addAdFeedback: (feedback: Omit<AdFeedback, 'id' | 'createdAt'>) => void;
  deleteAdFeedback: (id: string) => void;
  toggleAdFeedbackDone: (id: string) => void;

  addSocialPosts: (posts: Omit<SocialPost, 'id' | 'createdAt' | 'isDone'>[]) => void;
  updateSocialPost: (id: string, post: Partial<SocialPost>) => void;
  toggleSocialPostDone: (id: string) => void;
  deleteSocialPost: (id: string) => void;
  bulkToggleSocialPostDone: (ids: string[], isDone: boolean) => void;
  bulkDeleteSocialPost: (ids: string[]) => void;
  archiveAndClearSocialPosts: (monthName: string) => void;

  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      products: [],
      contentItems: [],
      adItems: [],
      socialPosts: [],
      pastReports: [],
      adFeedbacks: [],
      users: [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@demarkt.com',
          role: 'Admin',
          createdAt: new Date().toISOString()
        }
      ],
      companySettings: {
        name: 'MarketPlan',
      },
      
      updateCompanySettings: (settings) => set((state) => ({
        companySettings: { ...state.companySettings, ...settings }
      })),

      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateProduct: (id, updatedProduct) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...updatedProduct } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        contentItems: state.contentItems.filter((c) => c.productId !== id),
        adItems: state.adItems.filter((a) => a.productId !== id),
        adFeedbacks: state.adFeedbacks.filter((f) => f.productId !== id),
      })),
      
      addContent: (content) => set((state) => ({
        contentItems: [...state.contentItems, { ...content, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateContent: (id, updatedContent) => set((state) => ({
        contentItems: state.contentItems.map((c) => c.id === id ? { ...c, ...updatedContent } : c)
      })),
      deleteContent: (id) => set((state) => ({
        contentItems: state.contentItems.filter((c) => c.id !== id)
      })),
      
      addAd: (ad) => set((state) => ({
        adItems: [...state.adItems, { ...ad, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateAd: (id, updatedAd) => set((state) => ({
        adItems: state.adItems.map((a) => a.id === id ? { ...a, ...updatedAd } : a)
      })),
      deleteAd: (id) => set((state) => ({
        adItems: state.adItems.filter((a) => a.id !== id)
      })),

      addAdFeedback: (feedback) => set((state) => ({
        adFeedbacks: [...state.adFeedbacks, { ...feedback, id: uuidv4(), isDone: false, createdAt: new Date().toISOString() }]
      })),
      deleteAdFeedback: (id) => set((state) => ({
        adFeedbacks: state.adFeedbacks.filter((f) => f.id !== id)
      })),
      toggleAdFeedbackDone: (id) => set((state) => ({
        adFeedbacks: state.adFeedbacks.map((f) => f.id === id ? { ...f, isDone: !f.isDone } : f)
      })),

      addSocialPosts: (posts) => set((state) => ({
        socialPosts: [
          ...state.socialPosts,
          ...posts.map(p => ({ ...p, id: uuidv4(), isDone: false, createdAt: new Date().toISOString() }))
        ]
      })),
      updateSocialPost: (id, updatedPost) => set((state) => ({
        socialPosts: state.socialPosts.map(p => p.id === id ? { ...p, ...updatedPost } : p)
      })),
      toggleSocialPostDone: (id) => set((state) => ({
        socialPosts: state.socialPosts.map(p => p.id === id ? { ...p, isDone: !p.isDone } : p)
      })),
      deleteSocialPost: (id) => set((state) => ({
        socialPosts: state.socialPosts.filter(p => p.id !== id)
      })),
      bulkToggleSocialPostDone: (ids, isDone) => set((state) => ({
        socialPosts: state.socialPosts.map(p => ids.includes(p.id) ? { ...p, isDone } : p)
      })),
      bulkDeleteSocialPost: (ids) => set((state) => ({
        socialPosts: state.socialPosts.filter(p => !ids.includes(p.id))
      })),
      archiveAndClearSocialPosts: (monthName) => set((state) => {
        const total = state.socialPosts.length;
        const completed = state.socialPosts.filter(p => p.isDone).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const newReport: ContentReport = {
          id: uuidv4(),
          monthName,
          totalPosts: total,
          completedPosts: completed,
          completionRate: rate,
          archivedAt: new Date().toISOString()
        };

        return {
          pastReports: [...(state.pastReports || []), newReport],
          socialPosts: []
        };
      }),

      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      updateUser: (id, updatedUser) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, ...updatedUser } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),
    }),
    {
      name: 'marketing-planner-storage',
    }
  )
);
