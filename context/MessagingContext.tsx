import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Conversation, Message, PolicyListing, User } from '../types';

interface MessagingContextType {
  conversations: Conversation[];
  unreadTotal: number;
  startConversation: (listing: PolicyListing) => string;
  sendMatchRequest: (listing: PolicyListing) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
  currentUser: User | null;
  users: User[];
  login: (identifier: string) => User | null;
  logout: () => void;
  register: (name: string, role: 'buyer' | 'seller', email: string, kycData?: any, phone?: string) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  createUser: (userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  marketplaceListings: PolicyListing[];
  postListing: (listingData: Partial<PolicyListing>) => void;
  updateListing: (id: string, updates: Partial<PolicyListing>) => void;
  updateListingStatus: (id: string, status: 'approved' | 'rejected' | 'withdrawn') => void;
  deleteListing: (id: string) => void;
  unlistListing: (id: string) => void;
  toggleUserStatus: (userId: string) => void;
  toggleFavorite: (listingId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

// Mock Users
const MOCK_USERS: User[] = [
  { id: 'user_buyer', name: 'Chan Tai Man', role: 'buyer', email: 'buyer@example.com', phone: '+852 9123 4567', status: 'active', joinedDate: new Date('2024-01-15'), favorites: [] },
  { 
    id: 'user_buyer_verified', 
    name: 'Chris Wong (Verified)', 
    role: 'buyer', 
    email: 'verified@dev.com', 
    phone: '98765432', 
    kycData: {
        name: 'WONG CHRIS',
        dob: '15-05-1985',
        dateOfIssue: '20-06-2018'
    },
    status: 'active', 
    joinedDate: new Date('2023-12-01'), 
    favorites: [] 
  },
  // Assign this seller to the agent for demo purposes
  { id: 'user_seller', name: 'Wong Siu Ming', role: 'seller', email: 'seller@example.com', phone: '+852 9876 5432', status: 'active', joinedDate: new Date('2024-02-01'), createdBy: 'user_agent', favorites: [] },
  { id: 'user_agent', name: 'Agent Smith', role: 'agent', email: 'agent@dev.com', phone: '+852 6666 8888', status: 'active', joinedDate: new Date('2023-11-20'), favorites: [] },
  { id: 'user_admin', name: 'System Admin', role: 'admin', email: 'admin@dev.com', status: 'active', joinedDate: new Date('2023-01-01'), favorites: [] },
  { id: 'other_seller', name: 'Lee Ka Yan', role: 'seller', email: 'kayan@example.com', status: 'active', joinedDate: new Date('2024-03-10'), favorites: [] },
];

// Mock Data
const MOCK_INITIAL_CONVERSATION: Conversation = {
  id: 'conv_demo_1',
  listingId: 'DEV001',
  listingName: '「充裕未來」計劃 2',
  company: '友邦 AIA',
  sellerId: 'user_seller',
  sellerName: 'Wong Siu Ming',
  buyerId: 'user_buyer',
  buyerName: 'Chan Tai Man',
  unreadCount: 1, // This is a placeholder, will be recalculated dynamically
  lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  messages: [
    {
      id: 'msg_1',
      senderId: 'user_seller',
      text: 'Hello, I see you are interested in my policy listing. The transfer process is quite simple.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
    }
  ],
  participants: ['user_buyer', 'user_seller']
};

// Generate Initial Mock Listings
const generateMockListings = (): PolicyListing[] => {
  const initialData: PolicyListing[] = [
    {
      id: '1', listingId: "DEV001", company: "友邦 AIA", name: "「充裕未來」計劃 2", status: "paid-up", statusText: "已繳清",
      askingPrice: 88000, surrenderValue: 82000, totalSumAssured: 100000, irrForBuyer: "4.8%", yearsHeld: 8, premiumsPaid: 65000,
      remainingYears: 17, maturityYear: 2042, isPaidUp: true, approvalStatus: 'approved', sellerId: 'user_seller',
      applicationDate: new Date('2023-11-10'), publishDate: new Date('2023-11-15'), // Old date to show growth
      cashValueGrowthRate: 4.8
    },
    {
      id: '2', listingId: "DEV002", company: "保誠 Prudential", name: "「雋陞」儲蓄保障計劃", status: "paid-up", statusText: "已繳清",
      askingPrice: 155000, surrenderValue: 148000, totalSumAssured: 180000, irrForBuyer: "5.1%", yearsHeld: 10, premiumsPaid: 100000,
      remainingYears: 20, maturityYear: 2045, isPaidUp: true, approvalStatus: 'approved', sellerId: 'other_seller',
      applicationDate: new Date('2024-01-15'), publishDate: new Date('2024-01-20'),
      cashValueGrowthRate: 5.1
    },
    {
      id: '3', listingId: "DEV003", company: "宏利 Manulife", name: "宏達儲蓄保", status: "near-breakeven", statusText: "供款中 (近回本)",
      askingPrice: 45000, surrenderValue: 41500, totalSumAssured: 60000, irrForBuyer: "5.5%", yearsHeld: 5, premiumsPaid: 48000,
      remainingYears: 15, maturityYear: 2040, isPaidUp: false, approvalStatus: 'approved', sellerId: 'user_seller',
      applicationDate: new Date('2024-02-01'), publishDate: new Date('2024-02-05'),
      cashValueGrowthRate: 4.0,
      premiumFrequency: 'annually', premiumAmount: 5000
    },
    {
      id: '4', listingId: "DEV004", company: "永明 Sun Life", name: "驕陽儲蓄保障計劃", status: "high-guaranteed", statusText: "已繳清 (高保證)",
      askingPrice: 210000, surrenderValue: 205000, totalSumAssured: 250000, irrForBuyer: "4.5%", yearsHeld: 7, premiumsPaid: 130000,
      remainingYears: 18, maturityYear: 2043, isPaidUp: true, approvalStatus: 'approved', sellerId: 'other_seller',
      applicationDate: new Date('2024-03-10'), publishDate: new Date('2024-03-11'),
      cashValueGrowthRate: 4.5
    }
  ];
  
  // Generate some extra dummy data
  const companies = ["友邦 AIA", "保誠 Prudential", "宏利 Manulife", "永明 Sun Life", "富衛 FWD", "AXA 安盛"];
  const names = ["創富傳承", "雋陞系列", "宏達儲蓄", "驕陽計劃", "盈聚非凡", "安進儲蓄"];
  const statuses = ["paid-up", "near-breakeven", "high-guaranteed"];
  
  for (let i = 0; i < 8; i++) {
      const company = companies[i % companies.length];
      const statusIdx = i % statuses.length;
      const randomDaysAgoApp = Math.floor(Math.random() * 120) + 30; // 1-4 months ago
      const randomDaysAgoPub = randomDaysAgoApp - Math.floor(Math.random() * 3);
      
      const isPaidUp = statusIdx !== 1;

      initialData.push({
          id: `gen-${i}`,
          listingId: `DEV${String(i + 5).padStart(3, '0')}`,
          company: company,
          name: names[i % names.length],
          status: statuses[statusIdx] as any,
          statusText: statusIdx === 0 ? "已繳清" : statusIdx === 1 ? "供款中 (近回本)" : "已繳清 (高保證)",
          askingPrice: 50000 + (i * 12000),
          surrenderValue: 48000 + (i * 11000),
          totalSumAssured: 60000 + (i * 15000),
          irrForBuyer: (4.0 + (i * 0.1)).toFixed(1) + "%",
          yearsHeld: 5 + (i % 5),
          premiumsPaid: 40000 + (i * 10000),
          remainingYears: 10 + (i % 15),
          maturityYear: 2025 + 10 + (i % 15),
          isPaidUp: isPaidUp,
          approvalStatus: 'approved',
          sellerId: 'other_seller',
          applicationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * randomDaysAgoApp),
          publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * randomDaysAgoPub),
          cashValueGrowthRate: 4.0 + (i * 0.1),
          premiumFrequency: isPaidUp ? undefined : 'annually',
          premiumAmount: isPaidUp ? undefined : 2000 + (i * 500)
      });
  }
  return initialData;
};

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allConversations, setAllConversations] = useState<Conversation[]>([MOCK_INITIAL_CONVERSATION]);
  const [marketplaceListings, setMarketplaceListings] = useState<PolicyListing[]>(generateMockListings());
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Filter conversations for the current user and DYNAMICALLY calculate unread count
  const conversations = useMemo(() => {
    if (!currentUser) return [];
    
    return allConversations
      .filter(c => c.participants.includes(currentUser.id))
      .map(c => {
         // CRITICAL FIX: Calculate unread count specifically for the current user.
         // Count messages where:
         // 1. Sender is NOT the current user
         // 2. Message is NOT read
         const myUnreadCount = c.messages.filter(m => m.senderId !== currentUser.id && !m.isRead).length;
         
         return {
             ...c,
             unreadCount: myUnreadCount
         };
      });
  }, [allConversations, currentUser]);

  const unreadTotal = currentUser ? conversations.reduce((acc, conv) => {
      return acc + conv.unreadCount;
  }, 0) : 0;

  const login = (identifier: string): User | null => {
    // Try to find by email first (case-insensitive)
    let user = users.find(u => u.email.toLowerCase() === identifier.toLowerCase());
    
    // If not found by email, try by role (for demo buttons)
    if (!user) {
        user = users.find(u => u.role === identifier);
    }

    if (user) {
      if (user.status === 'suspended') {
        return null;
      }
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const register = (name: string, role: 'buyer' | 'seller', email: string, kycData?: any, phone?: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      role: role as any,
      email,
      phone,
      kycData,
      status: 'active',
      joinedDate: new Date(),
      favorites: []
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
  };

  const updateUser = (userId: string, data: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
      if (currentUser && currentUser.id === userId) {
          setCurrentUser(prev => prev ? { ...prev, ...data } : null);
      }
  };

  const createUser = (userData: Partial<User>) => {
      const newUser: User = {
          id: `user_${Date.now()}`,
          name: userData.name || 'New User',
          role: userData.role || 'seller',
          email: userData.email || '',
          status: 'active',
          joinedDate: new Date(),
          createdBy: currentUser?.id,
          favorites: [],
          ...userData
      };
      setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const startConversation = (listing: PolicyListing) => {
    if (!currentUser) throw new Error("Must be logged in");
    if (currentUser.id === listing.sellerId) throw new Error("Cannot chat with yourself");

    // Check if conversation already exists
    const existing = conversations.find(c => c.listingId === listing.listingId && c.participants.includes(listing.sellerId));
    if (existing) {
      return existing.id;
    }

    const seller = users.find(u => u.id === listing.sellerId);

    // Create new
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      listingId: listing.listingId,
      listingName: listing.name,
      company: listing.company,
      sellerId: listing.sellerId,
      sellerName: seller ? seller.name : 'Unknown Seller',
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      messages: [],
      unreadCount: 0, // Initial unread count is 0
      lastMessageTimestamp: new Date(),
      participants: [currentUser.id, listing.sellerId]
    };

    setAllConversations(prev => [newConv, ...prev]);
    return newConv.id;
  };

  const sendMatchRequest = (listing: PolicyListing) => {
    if (!currentUser) return;

    // 1. Identify Recipients
    const recipients: string[] = [];
    const seller = users.find(u => u.id === listing.sellerId);
    
    if (seller) {
        recipients.push(seller.id); // Always send to listing owner (Seller or Agent-as-Seller)
        
        // If seller was created by an agent, send to agent too
        if (seller.role === 'seller' && seller.createdBy) {
            recipients.push(seller.createdBy);
        }
    }

    // 2. Construct Message
    const contactInfo = `
[系統配對通知]
買家有意配對此保單。

買家資料:
姓名: ${currentUser.name}
電郵: ${currentUser.email}
電話: ${currentUser.phone || '未提供'}
    `.trim();

    // 3. Send to each recipient
    recipients.forEach(recipientId => {
        let recipientUser = users.find(u => u.id === recipientId);
        if (!recipientUser) return;

        setAllConversations(prev => {
            const existingIndex = prev.findIndex(c => 
                c.listingId === listing.listingId && 
                c.participants.includes(currentUser.id) && 
                c.participants.includes(recipientId)
            );

            const newMessage: Message = {
                id: `msg_${Date.now()}_${Math.random()}`,
                senderId: currentUser.id,
                text: contactInfo,
                timestamp: new Date(),
                isRead: false // Unread for recipient
            };

            if (existingIndex >= 0) {
                // Update existing
                const updatedConvs = [...prev];
                const conv = updatedConvs[existingIndex];
                updatedConvs[existingIndex] = {
                    ...conv,
                    messages: [...conv.messages, newMessage],
                    lastMessageTimestamp: newMessage.timestamp,
                    // unreadCount update is handled dynamically in useMemo, we just update the data
                };
                return updatedConvs;
            } else {
                // Create new
                const newConv: Conversation = {
                    id: `conv_${Date.now()}_${Math.random()}`,
                    listingId: listing.listingId,
                    listingName: listing.name,
                    company: listing.company,
                    sellerId: recipientId, 
                    sellerName: recipientUser!.name,
                    buyerId: currentUser.id,
                    buyerName: currentUser.name,
                    messages: [newMessage],
                    unreadCount: 0, // Placeholder, dynamic logic handles the rest
                    lastMessageTimestamp: newMessage.timestamp,
                    participants: [currentUser.id, recipientId]
                };
                return [newConv, ...prev];
            }
        });
    });
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
      isRead: false, // Important: Always false initially, meaning unread for the RECEIVER
    };

    setAllConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessageTimestamp: newMessage.timestamp,
        };
      }
      return conv;
    }).sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()));
  };

  const markAsRead = (conversationId: string) => {
    if (!currentUser) return;
    
    setAllConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        // Only mark messages as read if:
        // 1. I am NOT the sender (i.e., I am receiving them)
        // 2. They are currently unread
        const updatedMessages = conv.messages.map(m => {
            if (m.senderId !== currentUser.id && !m.isRead) {
                return { ...m, isRead: true };
            }
            return m;
        });

        // Optimization: Only update state object if changes occurred
        const hasChanges = updatedMessages.some((m, idx) => m.isRead !== conv.messages[idx].isRead);
        if (!hasChanges) return conv;

        return {
          ...conv,
          messages: updatedMessages
        };
      }
      return conv;
    }));
  };

  const postListing = (listingData: Partial<PolicyListing>) => {
      if (!currentUser) return;

      const isAgent = currentUser.role === 'agent';

      const newListing: PolicyListing = {
          id: `new_${Date.now()}`,
          listingId: `DEV${String(marketplaceListings.length + 10).padStart(3, '0')}`,
          company: listingData.company || 'Unknown',
          policyNumber: listingData.policyNumber,
          name: listingData.name || 'New Listing',
          status: listingData.status || 'paid-up',
          statusText: listingData.statusText || '已繳清',
          askingPrice: listingData.askingPrice || 0,
          surrenderValue: listingData.surrenderValue || 0,
          totalSumAssured: listingData.totalSumAssured || 0,
          irrForBuyer: listingData.irrForBuyer || '4.0%',
          yearsHeld: listingData.yearsHeld || 0,
          premiumsPaid: listingData.premiumsPaid || 0,
          remainingYears: listingData.remainingYears || 0,
          maturityYear: listingData.maturityYear || 2040,
          isPaidUp: listingData.isPaidUp || false,
          approvalStatus: isAgent ? 'approved' : 'pending',
          sellerId: currentUser.id,
          applicationDate: new Date(),
          publishDate: isAgent ? new Date() : undefined,
          cashValueGrowthRate: listingData.cashValueGrowthRate || 4.0,
          premiumFrequency: listingData.premiumFrequency,
          premiumAmount: listingData.premiumAmount
      };

      setMarketplaceListings(prev => [newListing, ...prev]);
  };

  const updateListing = (id: string, updates: Partial<PolicyListing>) => {
    setMarketplaceListings(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates } : l
    ));
  };

  const updateListingStatus = (id: string, status: 'approved' | 'rejected' | 'withdrawn') => {
    setMarketplaceListings(prev => prev.map(l => 
        l.id === id ? { 
            ...l, 
            approvalStatus: status,
            publishDate: status === 'approved' ? new Date() : l.publishDate
        } : l
    ));
  };

  const deleteListing = (id: string) => {
    setMarketplaceListings(prev => prev.filter(l => l.id !== id));
  };

  const unlistListing = (id: string) => {
    setMarketplaceListings(prev => prev.map(l => 
        l.id === id ? { ...l, approvalStatus: 'withdrawn' } : l
    ));
  };

  const toggleUserStatus = (userId: string) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      ));
  };

  const toggleFavorite = (listingId: string) => {
    if (!currentUser) return;
    
    const currentFavorites = currentUser.favorites || [];
    let newFavorites;
    
    if (currentFavorites.includes(listingId)) {
        newFavorites = currentFavorites.filter(id => id !== listingId);
    } else {
        newFavorites = [...currentFavorites, listingId];
    }
    
    const updatedUser = { ...currentUser, favorites: newFavorites };
    
    // Update current session user
    setCurrentUser(updatedUser);
    
    // Update master user list to persist in this mock session
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  return (
    <MessagingContext.Provider value={{ 
      conversations, 
      unreadTotal, 
      startConversation, 
      sendMatchRequest,
      sendMessage, 
      markAsRead, 
      currentUser,
      users,
      login,
      logout,
      register,
      updateUser,
      createUser,
      deleteUser,
      marketplaceListings,
      postListing,
      updateListing,
      updateListingStatus,
      deleteListing,
      unlistListing,
      toggleUserStatus,
      toggleFavorite
    }}>
      {children}
    </MessagingContext.Provider>
  );
};