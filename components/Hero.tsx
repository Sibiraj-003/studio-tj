import React, { useEffect, useRef } from 'react';
import { NavLink } from '../types';
import { ChevronDown, Instagram, MessageCircle, Phone, Mail } from 'lucide-react';

interface HeroProps {
  scrollToSection: (sectionId: string) => void;
}

const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Parallax calculations
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${scrollY * 0.5}px, 0) scale(1.1)`;
      }
      
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${scrollY * 0.2}px, 0)`;
        contentRef.current.style.opacity = `${1 - scrollY / 700}`;
      }

      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id={NavLink.HOME} className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-zinc-50">
      
      {/* Parallax Background Layer */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 will-change-transform origin-center"
      >
        {/* 
            PERFORMANCE OPTIMIZATION:
            1. Reduced width from w=2564 to w=1600 (sufficient for HD screens)
            2. Added fetchPriority="high" for LCP
            3. loading="eager"
            4. q=80 for compression
        */}
        <img 
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop" 
          alt="Camera Lens Background" 
          className="w-full h-full object-cover opacity-[0.08] grayscale"
          fetchPriority="high"  
          loading="eager"
          width="1600"
          height="900"
        />
        {/* MODERN FILM GRAIN TEXTURE */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>
      </div>

      {/* Social Sidebar (Right Side) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 md:right-12 z-30 hidden md:flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <a 
            href="https://www.instagram.com/stories_by_tj/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-white border border-zinc-200 rounded-full text-zinc-600 hover:text-brand-600 hover:border-brand-600 transition-all duration-300 hover:scale-110 shadow-md group relative"
            title="Instagram"
          >
            <Instagram className="w-5 h-5" />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                Instagram
            </span>
          </a>
          <a 
            href="https://wa.me/917667279175" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3.5 bg-white border border-zinc-200 rounded-full text-zinc-600 hover:text-green-600 hover:border-green-600 transition-all duration-300 hover:scale-110 shadow-md group relative"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
             <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                WhatsApp
            </span>
          </a>
          <a 
            href="tel:+917667279175" 
            className="p-3.5 bg-white border border-zinc-200 rounded-full text-zinc-600 hover:text-blue-600 hover:border-blue-600 transition-all duration-300 hover:scale-110 shadow-md group relative"
            title="Phone"
          >
            <Phone className="w-5 h-5" />
             <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                Call Us
            </span>
          </a>
          <a 
            href="mailto:storiesbytj@digieratech.in"
            className="p-3.5 bg-white border border-zinc-200 rounded-full text-zinc-600 hover:text-red-600 hover:border-red-600 transition-all duration-300 hover:scale-110 shadow-md group relative"
            title="Email"
          >
            <Mail className="w-5 h-5" />
             <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
                Email
            </span>
          </a>
      </div>

      {/* Content Layer */}
      <div 
        ref={contentRef}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-8 will-change-transform"
      >
        <p className="text-brand-600 tracking-[0.4em] uppercase text-xs md:text-sm font-semibold mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          The Art of Photography
        </p>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-light text-brand-600 leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Stories <br />
          <span className="italic text-brand-500">by TJ</span>
        </h1>
        
        <p className="text-zinc-900 max-w-xl mx-auto text-lg md:text-xl font-light leading-relaxed animate-fade-in-up font-sans font-medium" style={{ animationDelay: '0.4s' }}>
          Where modern aesthetics meet timeless storytelling. We craft visual narratives that resonate with elegance.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button 
            onClick={() => scrollToSection(NavLink.PORTFOLIO)}
            className="group relative px-8 py-4 bg-brand-600 text-white overflow-hidden transition-all duration-300 hover:bg-brand-700 w-full md:w-auto min-w-[180px] shadow-[0_10px_25px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)]"
          >
            <span className="relative z-10 font-medium tracking-widest uppercase text-xs">View Works</span>
          </button>
          
          <button 
            onClick={() => scrollToSection(NavLink.AI_ADVISOR)}
            className="group px-8 py-4 border border-zinc-400 hover:border-brand-600 text-black hover:text-brand-600 transition-all duration-300 w-full md:w-auto min-w-[180px] bg-white/50 backdrop-blur-sm hover:bg-white"
          >
            <span className="font-medium tracking-widest uppercase text-xs">AI Director</span>
          </button>
        </div>

        {/* Mobile Social Links (Visible only on small screens) */}
        <div className="flex md:hidden items-center justify-center gap-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <a 
              href="https://www.instagram.com/stories_by_tj/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-500 hover:text-brand-600 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a 
              href="https://wa.me/917667279175" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-500 hover:text-green-600 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
            <a 
              href="tel:+917667279175" 
              className="text-zinc-500 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-6 h-6" />
            </a>
            <a 
              href="mailto:storiesbytj@digieratech.in" 
              className="text-zinc-500 hover:text-red-600 transition-colors"
            >
              <Mail className="w-6 h-6" />
            </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-bounce cursor-pointer opacity-60 hover:opacity-100 transition-opacity" 
        onClick={() => scrollToSection(NavLink.PORTFOLIO)}
      >
        <ChevronDown size={32} className="text-black" />
      </div>
    </section>
  );
};

export default Hero;