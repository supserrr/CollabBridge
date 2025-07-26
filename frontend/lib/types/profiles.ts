export interface Professional {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  avatar?: string;
  location: string;
  skills: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  isVerified: boolean;
  followers: number;
  following: number;
  portfolioItems: PortfolioItem[];
  responseTime: string;
  completedProjects: number;
  specializations?: string[];
  languages?: string[];
  certifications?: string[];
  socialLinks?: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  professionalId: string;
  title: string;
  description: string;
  category: string;
  mediaType: 'image' | 'video' | 'document';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  eventDetails?: {
    eventType: string;
    location: string;
    date: string;
    clientName?: string;
  };
  metrics?: {
    views: number;
    likes: number;
    inquiries: number;
  };
}

export interface SocialLinks {
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  behance?: string;
  youtube?: string;
}
