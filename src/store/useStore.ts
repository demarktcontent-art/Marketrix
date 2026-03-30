import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ContentPlan, AdCampaign, User } from '../types';

interface AppState {
  user: User | null;
  products: Product[];
  contentPlans: ContentPlan[];
  adCampaigns: AdCampaign[];
  
  setUser: (user: User | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  addContentPlan: (plan: ContentPlan) => void;
  updateContentPlan: (id: string, plan: Partial<ContentPlan>) => void;
  deleteContentPlan: (id: string) => void;
  
  addAdCampaign: (campaign: AdCampaign) => void;
  updateAdCampaign: (id: string, campaign: Partial<AdCampaign>) => void;
  deleteAdCampaign: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      products: [],
      contentPlans: [],
      adCampaigns: [],
      
      setUser: (user) => set({ user }),
      
      addProduct: (product) => set((state) => ({ 
        products: [product, ...state.products] 
      })),
      updateProduct: (id, updatedProduct) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, ...updatedProduct } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id)
      })),
      
      addContentPlan: (plan) => set((state) => ({ 
        contentPlans: [plan, ...state.contentPlans] 
      })),
      updateContentPlan: (id, updatedPlan) => set((state) => ({
        contentPlans: state.contentPlans.map((p) => p.id === id ? { ...p, ...updatedPlan } : p)
      })),
      deleteContentPlan: (id) => set((state) => ({
        contentPlans: state.contentPlans.filter((p) => p.id !== id)
      })),
      
      addAdCampaign: (campaign) => set((state) => ({ 
        adCampaigns: [campaign, ...state.adCampaigns] 
      })),
      updateAdCampaign: (id, updatedCampaign) => set((state) => ({
        adCampaigns: state.adCampaigns.map((c) => c.id === id ? { ...c, ...updatedCampaign } : c)
      })),
      deleteAdCampaign: (id) => set((state) => ({
        adCampaigns: state.adCampaigns.filter((c) => c.id !== id)
      })),
    }),
    {
      name: 'demarkt-storage',
    }
  )
);
