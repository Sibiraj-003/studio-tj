import React, { useState, useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import AiAssistant from "./components/AiAssistant";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { NavLink, ServicePackage } from "./types";
import { CheckCircle } from "lucide-react";
import { api, UserData } from "./services/api";

// Lazy load heavy components
const AuthPage = lazy(() => import("./components/AuthPage"));
const BookingModal = lazy(() => import("./components/BookingModal"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const ClientDashboard = lazy(() => import("./components/ClientDashboard"));

const App: React.FC = () => {
  const [activeLink, setActiveLink] = useState<string>(NavLink.HOME);
  const [currentView, setCurrentView] = useState<
    "main" | "auth" | "admin" | "client"
  >("main");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(
    null
  );
  const [showToast, setShowToast] = useState(false);

  // Admin Check
  const isAdmin = user?.isAdmin === true;

  // Check auth state and increment visit counter on mount
  useEffect(() => {
    // 1. Auth Check
    const storedUser = localStorage.getItem("tj_studio_current_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
    }

    // 2. Visit Counter Logic (via API Service)
    api.incrementVisits();
  }, []);

  const handleLoginSuccess = () => {
    const storedUser = localStorage.getItem("tj_studio_current_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);

      // REDIRECTION LOGIC
      if (parsedUser.isAdmin) {
        setCurrentView("admin");
      } else {
        setCurrentView("main");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tj_studio_current_user");
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView("main");
  };

  const handleDashboardClick = () => {
    if (!isLoggedIn) return;
    if (isAdmin) {
      setCurrentView("admin");
    } else {
      setCurrentView("client");
    }
  };

  const handleBookClick = (pkg: ServicePackage) => {
    if (!isLoggedIn) {
      setCurrentView("auth");
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
      notes: details.notes,
    });

    setIsBookingModalOpen(false);
    setSelectedPackage(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Intersection Observer
  useEffect(() => {
    if (currentView !== "main") return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    });

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [currentView]);

  const scrollToSection = (sectionId: string) => {
    if (currentView !== "main") {
      setCurrentView("main");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // --- VIEW RENDERING ---

  if (currentView === "auth") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <span>Loading...</span>
          </div>
        }
      >
        <AuthPage
          onBack={() => setCurrentView("main")}
          onLoginSuccess={handleLoginSuccess}
        />
      </Suspense>
    );
  }

  // Common wrapper for Dashboard views
  const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <>
      <Navbar
        activeLink={NavLink.ADMIN}
        scrollToSection={scrollToSection}
        onLoginClick={() => setCurrentView("auth")}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onDashboardClick={handleDashboardClick}
      />
      {children}
    </>
  );

  if (currentView === "admin" && isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <span>Loading...</span>
          </div>
        }
      >
        <DashboardLayout>
          <AdminDashboard onBack={() => setCurrentView("main")} />
        </DashboardLayout>
      </Suspense>
    );
  }

  if (currentView === "client" && isLoggedIn && !isAdmin && user) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <span>Loading...</span>
          </div>
        }
      >
        <DashboardLayout>
          <ClientDashboard user={user} onBack={() => setCurrentView("main")} />
        </DashboardLayout>
      </Suspense>
    );
  }

  // MAIN VIEW
  return (
    <div className="bg-white min-h-screen relative">
      <Navbar
        activeLink={activeLink}
        scrollToSection={scrollToSection}
        onLoginClick={() => setCurrentView("auth")}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onDashboardClick={handleDashboardClick}
      />
      <main>
        <Hero scrollToSection={scrollToSection} />
        {/* <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Engagement"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-zinc-600/60 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Engagement
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Wedding"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-zinc-500/50 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Wedding
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Baby Shower"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1596386461350-326256f8e77e?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-rose-800/60 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Baby Shower
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Maternity"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1591035897819-f4bdf739f446?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-slate-700/60 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Maternity
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Outdoor"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-zinc-600/40 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Outdoor
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <img
                  alt="Puberty"
                  loading="lazy"
                  width="600"
                  height="800"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://images.unsplash.com/photo-1627063539870-b8d4512e2307?q=80&amp;w=600&amp;auto=format&amp;fit=crop"
                />
                <div className="absolute inset-0 transition-opacity duration-300 bg-zinc-500/50 mix-blend-multiply group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight text-white">
                    Puberty
                  </h3>
                  <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-arrow-right w-4 h-4 text-white group-hover:text-black transition-colors"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
        <Portfolio />
        <AiAssistant />
        <Services scrollToSection={scrollToSection} onBook={handleBookClick} />
        <Contact />
      </main>
      <Footer />

      {/* Booking Modal */}
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
            <p className="text-xs text-zinc-300">
              We will be in touch shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
