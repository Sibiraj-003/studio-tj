
export interface PhotoItem {
  id: number;
  url: string;
  category: string;
  title: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

export interface AiConceptResult {
  title: string;
  mood: string;
  wardrobe: string[];
  shotList: string[];
  lighting: string;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageName: string;
  eventType: string;
  price: string;
  date: string;
  location: string;
  notes: string;
  createdAt: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  deliveryStatus?: 'delivered' | 'processing';
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export enum NavLink {
  HOME = 'home',
  PORTFOLIO = 'portfolio',
  AI_ADVISOR = 'ai-advisor',
  SERVICES = 'services',
  CONTACT = 'contact',
  ADMIN = 'admin-dashboard'
}
