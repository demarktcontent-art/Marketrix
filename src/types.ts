export type Platform = 'shopee' | 'lazada' | 'tiktok' | 'all';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  platform: Platform;
  stock: number;
  imageUrl?: string;
  websiteLink?: string;
  videoLink?: string;
  createdAt: string;
}

export interface ContentPlan {
  id: string;
  productId: string;
  platform: Platform;
  title: string;
  body: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: string;
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  productId: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
  platform: Platform;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
