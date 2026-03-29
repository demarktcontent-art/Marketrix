export type Product = {
  id: string;
  name: string;
  buyingPrice: number;
  sellingPrice: number;
  websiteLink?: string;
  createdAt: string;
};

export type ContentStatus = 'Idea' | 'In Progress' | 'Review' | 'Published';
export type ContentType = 'Post' | 'Reel' | 'Story' | 'Blog' | 'Video';

export type ContentItem = {
  id: string;
  productId: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  scheduledDate: string;
  description?: string;
  createdAt: string;
};

export type SocialPost = {
  id: string;
  date: string;
  type: string;
  themeProduct: string;
  visualDescription: string;
  copyCaption: string;
  isDone: boolean;
  createdAt: string;
};

export type ContentReport = {
  id: string;
  monthName: string;
  totalPosts: number;
  completedPosts: number;
  completionRate: number;
  archivedAt: string;
};

export type AdStatus = 'Planning' | 'Ready to Live Ad' | 'Live Ad';
export type AdPlatform = 'Facebook' | 'Google' | 'TikTok';

export type AdItem = {
  id: string;
  productId: string;
  platform: AdPlatform;
  status: AdStatus;
  mediaLinks: string[]; // URLs to Drive, FB, etc.
  createdAt: string;
};

export type AdFeedback = {
  id: string;
  productId: string;
  text: string;
  isDone?: boolean;
  createdAt: string;
};

export type UserRole = 'Admin' | 'Ads Manager' | 'Content Manager';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type CompanySettings = {
  name: string;
  logoUrl?: string;
};
