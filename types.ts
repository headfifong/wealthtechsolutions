export interface PolicyListing {
  id: string;
  listingId: string;
  company: string;
  policyNumber?: string;
  name: string;
  status: 'paid-up' | 'near-breakeven' | 'high-guaranteed' | 'paying';
  statusText: string;
  askingPrice: number;
  surrenderValue: number;
  totalSumAssured: number;
  irrForBuyer: string;
  yearsHeld: number;
  premiumsPaid: number;
  remainingYears: number;
  maturityYear: number;
  isPaidUp: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  sellerId: string;
  applicationDate?: Date;
  publishDate?: Date;
  // New Fields for Valuation Logic
  premiumFrequency?: 'monthly' | 'annually' | 'single';
  premiumAmount?: number;
  cashValueGrowthRate?: number; // Annual percentage (e.g. 4.5)
}

export interface AnalysisDataPoint {
  year: string;
  totalCost: number;
  cashValue: number;
  breakeven: boolean;
}

export interface SearchResult {
  id: number;
  name: string;
  company: string;
  avgReturn: number;
  term: number;
  matchScore: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingName: string;
  company: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  messages: Message[];
  unreadCount: number;
  lastMessageTimestamp: Date;
  participants: string[];
}

export interface User {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  email: string;
  phone?: string;
  kycData?: any;
  status?: 'active' | 'suspended';
  joinedDate?: Date;
  createdBy?: string;
  favorites?: string[]; // Array of Listing IDs
}