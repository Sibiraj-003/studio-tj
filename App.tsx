import React, { useState, useEffect, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import Portfolio from './components/Portfolio';
import Services from './components/Services';
import AiAssistant from './components/AiAssistant';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { NavLink, ServicePackage } from './types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { api, UserData } from './services/api';

// Lazy Load Heavy Components
const AuthPage = React.lazy(() => import('./components/AuthPage'));
const BookingModal = React.lazy(() => import('./components/BookingModal'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const ClientDashboard = React.lazy(() => import('./components/ClientDashboard'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-50">
    <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
  </div>
);

const App: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>(NavLink.HOME);
  const [currentView, setCurrentView] = useState<'main' | 'auth' | 'admin' | 'client'>('main');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  
  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Admin Check
  const isAdmin = user?.isAdmin === true;

  // Check auth state and increment visit counter on mount
  useEffect(() => {
    // 1. Auth Check
    const storedUser = localStorage.getItem('tj_studio_current_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
    }

    // 2. Visit Counter Logic (via API Service)
    // Defer this slightly to prioritize UI rendering
    setTimeout(() => {
        api.incrementVisits();
    }, 2000);
  }, []);

  const handleLoginSuccess = () => {
    const storedUser = localStorage.getItem('tj_studio_current_user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUser(parsedUser);
        
        // REDIRECTION LOGIC
        if (parsedUser.isAdmin) {
            setCurrentView('admin');
        } else {
            setCurrentView('main');
        }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tj_studio_current_user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('main');
  };

  const handleDashboardClick = () => {
      if (!isLoggedIn) return;
      if (isAdmin) {
          setCurrentView('admin');
      } else {
          setCurrentView('client');
      }
  };

  const handleBookClick = (pkg: ServicePackage) => {
    if (!isLoggedIn) {
      setCurrentView('auth');
      return;
    }
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  const handleBookingConfirm = async (details: any) => {
    if (!selectedPackage) return;

    // Use API Service
    await api.createBooking({
        clientName: details.name,
        clientEmail: details.email,
        clientPhone: details.phone,
        packageName: selectedPackage.name,
        eventType: details.eventType,
        price: selectedPackage.price,
        date: details.date,
        location: details.location,
        notes: details.notes
    });

    setIsBookingModalOpen(false);
    setSelectedPackage(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Intersection Observer
  useEffect(() => {
    if (currentView !== 'main') return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, [currentView]);

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'main') {
        setCurrentView('main');
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  // --- VIEW RENDERING ---

  if (currentView === 'auth') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuthPage 
            onBack={() => setCurrentView('main')} 
            onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>
    );
  }

  // Common wrapper for Dashboard views
  const DashboardLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <>
         <Navbar 
            activeLink={NavLink.ADMIN} 
            scrollToSection={scrollToSection} 
            onLoginClick={() => setCurrentView('auth')}
            onLogoutClick={handleLogout}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            onDashboardClick={handleDashboardClick}
        />
        {children}
    </>
  );

  if (currentView === 'admin' && isAdmin) {
    return (
        <DashboardLayout>
            <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard onBack={() => setCurrentView('main')} />
            </Suspense>
        </DashboardLayout>
    );
  }

  if (currentView === 'client' && isLoggedIn && !isAdmin && user) {
    return (
        <DashboardLayout>
            <Suspense fallback={<LoadingFallback />}>
                <ClientDashboard user={user} onBack={() => setCurrentView('main')} />
            </Suspense>
        </DashboardLayout>
    );
  }

  // MAIN VIEW
  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden">
      <Navbar 
        activeLink={activeLink} 
        scrollToSection={scrollToSection} 
        onLoginClick={() => setCurrentView('auth')}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onDashboardClick={handleDashboardClick}
      />
      <main>
        <Hero scrollToSection={scrollToSection} />
        {/* Components below the fold don't need Suspense/Lazy as they are standard imports, 
            but images within them will be lazy loaded via their components */}
        <CategoryGrid />
        <Portfolio />
        <AiAssistant />
        <Services scrollToSection={scrollToSection} onBook={handleBookClick} />
        <Contact />
      </main>
      <Footer />

      {/* Booking Modal - Lazy Loaded */}
      <Suspense fallback={null}>
        {isBookingModalOpen && (
            <BookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                selectedPackage={selectedPackage}
                currentUser={user}
                onConfirm={handleBookingConfirm}
            />
        )}
      </Suspense>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-green-900 text-white px-6 py-4 rounded-sm shadow-2xl flex items-center space-x-3 z-[60] animate-fade-in-up">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
                <p className="font-serif italic text-lg">Booking Confirmed</p>
                <p className="text-xs text-zinc-300">We will be in touch shortly.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;