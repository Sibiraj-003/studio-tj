import { Booking, Inquiry } from '../types';
import { db } from './firebase';
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, where, getDoc, setDoc, increment 
} from 'firebase/firestore';

// --- TYPES ---
export interface UserData {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  authProvider?: string;
  createdAt?: number;
}

// --- CONFIGURATION ---
// IMPORTANT: Add your email address here to access the Admin Dashboard.
const ADMIN_EMAILS = [
    'admin@storiesbytj.com',      
    'storiesbytj@gmail.com',
    'storiesbytj01@gmail.com',
    'storiesbytj@digieratech.in'
];

// --- SECURITY HELPER ---
const hashPassword = async (text: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- CONNECTION STATE ---
let isCloudConnected = false;

// --- HELPER: OFFLINE LOGIC (LocalStorage Fallback) ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const offline = {
    // Save a booking to local storage
    saveBooking: async (bookingBase: any) => {
        await delay(800);
        const newBooking = { ...bookingBase, id: crypto.randomUUID() };
        const bookingsStr = localStorage.getItem('tj_studio_bookings');
        const bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        bookings.push(newBooking);
        localStorage.setItem('tj_studio_bookings', JSON.stringify(bookings));
        window.dispatchEvent(new Event('storage'));
        return newBooking;
    },

    // Save an inquiry (message) to local storage
    saveInquiry: async (inquiry: any) => {
        await delay(800);
        const inquiriesStr = localStorage.getItem('tj_studio_inquiries');
        const inquiries = inquiriesStr ? JSON.parse(inquiriesStr) : [];
        const newInquiry = { ...inquiry, id: crypto.randomUUID() };
        inquiries.push(newInquiry);
        localStorage.setItem('tj_studio_inquiries', JSON.stringify(inquiries));
        window.dispatchEvent(new Event('storage'));
        return true;
    },

    // Get all bookings from local storage
    getBookings: async () => {
        await delay(300);
        const bookingsStr = localStorage.getItem('tj_studio_bookings');
        return bookingsStr ? JSON.parse(bookingsStr) : [];
    },

    // Update a booking in local storage
    updateBooking: async (id: string, updates: any) => {
        await delay(300);
        const bookingsStr = localStorage.getItem('tj_studio_bookings');
        let bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        bookings = bookings.map((b: any) => b.id === id ? { ...b, ...updates } : b);
        localStorage.setItem('tj_studio_bookings', JSON.stringify(bookings));
        window.dispatchEvent(new Event('storage'));
    },

    // Delete a booking in local storage
    deleteBooking: async (id: string) => {
        await delay(300);
        const bookingsStr = localStorage.getItem('tj_studio_bookings');
        let bookings = bookingsStr ? JSON.parse(bookingsStr) : [];
        bookings = bookings.filter((b: any) => b.id !== id);
        localStorage.setItem('tj_studio_bookings', JSON.stringify(bookings));
        window.dispatchEvent(new Event('storage'));
    },

    // Update an inquiry (e.g. mark read)
    updateInquiry: async (id: string, updates: any) => {
        await delay(300);
        const inquiriesStr = localStorage.getItem('tj_studio_inquiries');
        let inquiries = inquiriesStr ? JSON.parse(inquiriesStr) : [];
        inquiries = inquiries.map((i: any) => i.id === id ? { ...i, ...updates } : i);
        localStorage.setItem('tj_studio_inquiries', JSON.stringify(inquiries));
        window.dispatchEvent(new Event('storage'));
    },

    // Subscribe to changes (Simulated real-time)
    subscribe: (callback: any, emailFilter?: string) => {
        const load = () => {
            const bookingsStr = localStorage.getItem('tj_studio_bookings');
            let data = bookingsStr ? JSON.parse(bookingsStr) : [];
            
            if (emailFilter) {
                data = data.filter((b: any) => b.clientEmail.toLowerCase() === emailFilter.toLowerCase());
            }
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            callback(data);
        };
        
        load();
        window.addEventListener('storage', load);
        const interval = setInterval(load, 2000); 

        return () => {
            window.removeEventListener('storage', load);
            clearInterval(interval);
        };
    },

    // Subscribe to Inquiries
    subscribeInquiries: (callback: any) => {
        const load = () => {
            const inquiriesStr = localStorage.getItem('tj_studio_inquiries');
            const data = inquiriesStr ? JSON.parse(inquiriesStr) : [];
            data.sort((a: any, b: any) => b.createdAt - a.createdAt);
            callback(data);
        };
        load();
        window.addEventListener('storage', load);
        const interval = setInterval(load, 2000);
        return () => {
             window.removeEventListener('storage', load);
             clearInterval(interval);
        };
    },

    // Local Storage Login (Fallback)
    login: async (email: string, password: string) => {
        await delay(500);
        const usersStr = localStorage.getItem('tj_studio_users');
        const users: UserData[] = usersStr ? JSON.parse(usersStr) : [];
        const normalizedEmail = email.toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
        
        const hashedPassword = await hashPassword(password);

        // Admin Seed Check (Check plain text for seed entry, store hash if creating new)
        const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
        if (isAdmin && password === 'Admin@1234') {
             return { id: 'admin-seed', name: 'TJ Admin', email: normalizedEmail, isAdmin: true };
        }

        if (!user) throw new Error('Account not found (Local).');
        
        // Compare Hashed Passwords
        if (user.password !== hashedPassword) throw new Error('Incorrect password.');
        return user;
    },

    register: async (name: string, email: string, password: string) => {
        await delay(500);
        const usersStr = localStorage.getItem('tj_studio_users');
        const users: UserData[] = usersStr ? JSON.parse(usersStr) : [];
        const normalizedEmail = email.toLowerCase().trim();
        if (users.find(u => u.email.toLowerCase() === normalizedEmail)) throw new Error('User already exists (Local).');
        
        const hashedPassword = await hashPassword(password);
        const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
        const newUser = { id: crypto.randomUUID(), name, email: normalizedEmail, password: hashedPassword, isAdmin };
        users.push(newUser);
        localStorage.setItem('tj_studio_users', JSON.stringify(users));
        return newUser;
    },

    // Local visits
    incrementVisits: () => {
        const current = parseInt(localStorage.getItem('tj_studio_visits') || '0');
        localStorage.setItem('tj_studio_visits', (current + 1).toString());
    },

    getVisits: async () => {
        await delay(100);
        return parseInt(localStorage.getItem('tj_studio_visits') || '0');
    }
};

// --- API SERVICE ---
export const api = {
  
  // CHECKER
  getConnectionStatus: () => isCloudConnected,

  // 1. AUTHENTICATION (Cloud First)
  login: async (email: string, password: string): Promise<UserData> => {
    // Strict Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) throw new Error('Please enter a valid email address.');
    const normalizedEmail = email.toLowerCase().trim();
    
    // Compute Hash
    const hashedPassword = await hashPassword(password);

    // CLOUD ATTEMPT
    if (db) {
        try {
            const q = query(collection(db, "users"), where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Allow Hardcoded Admin Logic even on Cloud if not found
                 const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
                 if (isAdmin && password === 'Admin@1234') {
                     // Auto-create Admin in cloud for future with HASHED PASSWORD
                     const adminUser = { name: 'TJ Admin', email: normalizedEmail, isAdmin: true, password: hashedPassword };
                     await addDoc(collection(db, 'users'), adminUser);
                     return { id: 'admin-new', ...adminUser };
                 }
                 throw new Error('Account not found.');
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data() as UserData;

            // Password Check (Compare Hashes)
            if (userData.password !== hashedPassword) {
                 throw new Error('Incorrect password.');
            }

            // Sync Admin Status
            const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
            if (userData.isAdmin !== isAdmin) {
                 await updateDoc(doc(db, "users", userDoc.id), { isAdmin });
                 userData.isAdmin = isAdmin;
            }

            isCloudConnected = true;
            return { ...userData, id: userDoc.id };

        } catch (e: any) {
            console.warn("System: Cloud login failed/error. " + e.message);
            if (e.message === 'Account not found.' || e.message === 'Incorrect password.') throw e;
            // Fallback to local only if connection error
            isCloudConnected = false;
            return offline.login(email, password);
        }
    }

    // FALLBACK
    isCloudConnected = false;
    return offline.login(email, password);
  },

  register: async (name: string, email: string, password: string): Promise<UserData> => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) throw new Error('Please enter a valid email address.');
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
    
    const hashedPassword = await hashPassword(password);

    const newUser = {
        name,
        email: normalizedEmail,
        password: hashedPassword, // Store Hash
        isAdmin,
        createdAt: Date.now()
    };

    // CLOUD ATTEMPT
    if (db) {
        try {
            // Check if user exists
            const q = query(collection(db, "users"), where("email", "==", normalizedEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) throw new Error('User already exists.');

            // Add to Cloud
            const docRef = await addDoc(collection(db, "users"), newUser);
            isCloudConnected = true;
            return { id: docRef.id, ...newUser } as UserData;

        } catch (e: any) {
             console.warn("System: Cloud register failed. " + e.message);
             if (e.message === 'User already exists.') throw e;
             isCloudConnected = false;
             return offline.register(name, email, password);
        }
    }

    // FALLBACK
    isCloudConnected = false;
    return offline.register(name, email, password);
  },

  googleAuth: async (name: string, email: string): Promise<UserData> => {
    await delay(500);
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalizedEmail);
    
    // CLOUD ATTEMPT
    if (db) {
        try {
             const q = query(collection(db, "users"), where("email", "==", normalizedEmail));
             const querySnapshot = await getDocs(q);
             
             if (querySnapshot.empty) {
                 // Create new google user in cloud
                 const newUser = { name, email: normalizedEmail, isAdmin, authProvider: 'google', createdAt: Date.now() };
                 const docRef = await addDoc(collection(db, "users"), newUser);
                 return { id: docRef.id, ...newUser } as UserData;
             } else {
                 // Return existing
                 const userDoc = querySnapshot.docs[0];
                 const userData = userDoc.data() as UserData;
                 // Update admin status if needed
                 if (userData.isAdmin !== isAdmin) {
                     await updateDoc(doc(db, "users", userDoc.id), { isAdmin });
                     userData.isAdmin = isAdmin;
                 }
                 return { ...userData, id: userDoc.id };
             }
        } catch (e) {
             console.warn("System: Cloud Google Auth failed, falling back.");
        }
    }

    // FALLBACK (Offline Logic)
    const usersStr = localStorage.getItem('tj_studio_users');
    const users: UserData[] = usersStr ? JSON.parse(usersStr) : [];
    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
        user = { id: crypto.randomUUID(), name, email: normalizedEmail, isAdmin: isAdmin };
        users.push(user);
        localStorage.setItem('tj_studio_users', JSON.stringify(users));
    }
    return { id: user.id, name: user.name, email: user.email, isAdmin: isAdmin };
  },

  // 2. BOOKINGS (Cloud First)
  createBooking: async (bookingDetails: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentStatus' | 'deliveryStatus'>): Promise<Booking> => {
      const newBooking = {
          ...bookingDetails,
          createdAt: Date.now(),
          status: 'upcoming' as const,
          paymentStatus: 'pending' as const,
          deliveryStatus: 'processing' as const,
      };

      if (db) {
          try {
              const docRef = await addDoc(collection(db, "bookings"), newBooking);
              isCloudConnected = true;
              return { id: docRef.id, ...newBooking };
          } catch (e) {
              console.warn("System: Cloud createBooking failed. " + e);
          }
      }
      isCloudConnected = false;
      return offline.saveBooking(newBooking);
  },

  subscribeBookings: (callback: (bookings: Booking[]) => void) => {
      if (db) {
          try {
              const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
              const unsubscribe = onSnapshot(q, (snapshot) => {
                  isCloudConnected = true;
                  const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                  callback(bookings);
              }, (error) => {
                  console.warn("System: Cloud subscribeBookings failed.", error);
                  isCloudConnected = false;
              });
              return unsubscribe;
          } catch (e) {
              console.warn("System: Cloud subscribeBookings setup failed.");
          }
      }
      return offline.subscribe(callback);
  },

  subscribeClientBookings: (email: string, callback: (bookings: Booking[]) => void) => {
      if (db) {
          try {
              // Note: Composite index might be needed for where + orderBy. 
              // Fallback to client-side sort if needed or ensure index exists.
              const q = query(
                  collection(db, "bookings"), 
                  where("clientEmail", "==", email)
                  // orderBy("createdAt", "desc") // May require index
              );
              const unsubscribe = onSnapshot(q, (snapshot) => {
                  isCloudConnected = true;
                  const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                  bookings.sort((a, b) => b.createdAt - a.createdAt); // Client side sort
                  callback(bookings);
              }, (error) => {
                  console.warn("System: Cloud subscribeClientBookings failed.", error);
                  isCloudConnected = false;
              });
              return unsubscribe;
          } catch (e) {
              console.warn("System: Cloud subscribeClientBookings setup failed.");
          }
      }
      return offline.subscribe(callback, email);
  },

  updateBooking: async (id: string, updates: Partial<Booking>) => {
      if (db) {
          try {
              const docRef = doc(db, "bookings", id);
              await updateDoc(docRef, updates);
              isCloudConnected = true;
              return;
          } catch (e) {
              console.warn("System: Cloud updateBooking failed.");
          }
      }
      return offline.updateBooking(id, updates);
  },

  deleteBooking: async (id: string) => {
      if (db) {
          try {
              await deleteDoc(doc(db, "bookings", id));
              isCloudConnected = true;
              return;
          } catch (e) {
              console.warn("System: Cloud deleteBooking failed.");
          }
      }
      return offline.deleteBooking(id);
  },

  // 3. INQUIRIES
  submitInquiry: async (inquiryDetails: { name: string, email: string, message: string }) => {
      const newInquiry = {
          ...inquiryDetails,
          createdAt: Date.now(),
          read: false
      };

      if (db) {
          try {
              await addDoc(collection(db, "inquiries"), newInquiry);
              isCloudConnected = true;
              return true;
          } catch (e) {
              console.warn("System: Cloud submitInquiry failed.");
          }
      }
      return offline.saveInquiry(newInquiry);
  },

  subscribeInquiries: (callback: (inquiries: Inquiry[]) => void) => {
      if (db) {
          try {
              const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
              const unsubscribe = onSnapshot(q, (snapshot) => {
                  isCloudConnected = true;
                  const inquiries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
                  callback(inquiries);
              }, (error) => {
                  console.warn("System: Cloud subscribeInquiries failed.");
                  isCloudConnected = false;
              });
              return unsubscribe;
          } catch (e) {
              console.warn("System: Cloud subscribeInquiries setup failed.");
          }
      }
      return offline.subscribeInquiries(callback);
  },

  markInquiryRead: async (id: string) => {
      if (db) {
          try {
              await updateDoc(doc(db, "inquiries", id), { read: true });
              isCloudConnected = true;
              return;
          } catch (e) {
              console.warn("System: Cloud markInquiryRead failed.");
          }
      }
      return offline.updateInquiry(id, { read: true });
  },

  deleteInquiry: async (id: string) => {
      if (db) {
          try {
              await deleteDoc(doc(db, "inquiries", id));
              isCloudConnected = true;
              return;
          } catch (e) {
              console.warn("System: Cloud deleteInquiry failed.");
          }
      }
      // Offline/localStorage fallback
      await delay(300);
      const inquiriesStr = localStorage.getItem('tj_studio_inquiries');
      let inquiries = inquiriesStr ? JSON.parse(inquiriesStr) : [];
      inquiries = inquiries.filter((i: any) => i.id !== id);
      localStorage.setItem('tj_studio_inquiries', JSON.stringify(inquiries));
      window.dispatchEvent(new Event('storage'));
  },

  // 4. ANALYTICS
  incrementVisits: async () => {
      if (db) {
          try {
            const statsRef = doc(db, "analytics", "stats");
            // Check if exists, if not create
            try {
                await updateDoc(statsRef, { visits: increment(1) });
            } catch (err: any) {
                // If doc doesn't exist, set it
                if (err.code === 'not-found' || err.message?.includes('No document to update')) {
                     await setDoc(statsRef, { visits: 1 });
                } else {
                    throw err;
                }
            }
            isCloudConnected = true;
            return;
          } catch (e) {
             console.warn("System: Cloud incrementVisits failed.");
          }
      }
      offline.incrementVisits();
  },

  getVisits: async (): Promise<number> => {
      if (db) {
          try {
              const statsRef = doc(db, "analytics", "stats");
              const snap = await getDoc(statsRef);
              if (snap.exists()) {
                  isCloudConnected = true;
                  return snap.data().visits || 0;
              }
              return 0;
          } catch (e) {
              console.warn("System: Cloud getVisits failed.");
          }
      }
      return offline.getVisits();
  }
};