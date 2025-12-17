import React, { useEffect, useRef } from 'react';
import { NavLink, ServicePackage } from '../types';
import { Check } from 'lucide-react';

interface ServicesProps {
  scrollToSection: (sectionId: string) => void;
  onBook: (pkg: ServicePackage) => void;
}

const Services: React.FC<ServicesProps> = ({ scrollToSection, onBook }) => {
  const watermarkRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reveal observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    // Parallax logic for watermark and background
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (watermarkRef.current) {
        // Move text horizontally based on scroll
        watermarkRef.current.style.transform = `translateX(${scrolled * -0.1}px)`;
      }
      if (bgImageRef.current) {
        // Subtle vertical parallax for the camera background
        const offset = scrolled * 0.02;
        bgImageRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.1)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const packages: ServicePackage[] = [
    {
      id: 'essential',
      name: 'The Essential',
      price: '$450',
      description: 'Perfect for professional headshots or quick couple sessions.',
      features: ['1 Hour Session', '1 Location', '15 High-Res Edits', 'Online Gallery', 'Print Rights']
    },
    {
      id: 'signature',
      name: 'Signature',
      price: '$850',
      description: 'Our most popular choice for engagements and fashion editorials.',
      features: ['2.5 Hour Session', '2 Locations', '40 High-Res Edits', 'Wardrobe Consultation', 'Online Gallery', 'Social Media Cuts']
    },
    {
      id: 'heirloom',
      name: 'The Heirloom',
      price: '$2,200',
      description: 'Full day coverage for weddings or brand campaigns.',
      features: ['8 Hour Coverage', 'Multiple Locations', 'Full Gallery (300+)', 'Second Shooter', 'Fine Art Album', 'Drone Photography']
    }
  ];

  return (
    <section id={NavLink.SERVICES} className="py-32 bg-zinc-50 relative overflow-hidden">
      
      {/* Camera Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
            ref={bgImageRef}
            src="https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=2070&auto=format&fit=crop" 
            alt="Vintage Camera Background" 
            className="w-full h-full object-cover opacity-[0.03] grayscale will-change-transform origin-center"
        />
      </div>

      {/* Background Architectural Lines for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none flex justify-center z-0">
         <div className="w-px h-full bg-zinc-200/50 hidden md:block absolute left-[10%]"></div>
         <div className="w-px h-full bg-zinc-200/50 hidden md:block absolute left-[90%]"></div>
         <div className="w-px h-full bg-zinc-200/50 hidden md:block"></div> 
      </div>

      {/* Parallax Watermark */}
      <div 
        ref={watermarkRef}
        className="absolute top-40 left-0 whitespace-nowrap opacity-5 pointer-events-none select-none will-change-transform z-0"
      >
        <span className="text-[140px] md:text-[200px] font-serif font-bold text-brand-600 leading-none">INVESTMENT</span>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="text-center mb-24 max-w-2xl mx-auto reveal-on-scroll">
          <h2 className="text-brand-600 tracking-widest text-sm uppercase font-semibold mb-3">Investment</h2>
          <h3 className="text-4xl md:text-5xl font-serif text-black mb-6">Curated Collections</h3>
          <div className="h-[1px] w-[55px] bg-[#C62828] mx-auto mb-6"></div>
          <p className="text-zinc-800 font-light text-lg">Transparent pricing for timeless memories. No hidden fees, just pure artistry.</p>
        </div>

        {/* Layout: Standard vertical stack with Gap-16 for even spacing */}
        <div className="flex flex-col gap-16 items-center"> 
          
          {packages.map((pkg, index) => (
            <div 
              key={pkg.id} 
              className="w-full max-w-5xl relative group reveal-on-scroll"
            >
               {/* Left Creative Element: Large Number */}
               <div className="hidden xl:block absolute -left-40 top-0 transition-transform duration-700 group-hover:-translate-x-4 pointer-events-none">
                  <span className="text-9xl font-serif font-bold text-zinc-300 italic opacity-60">0{index + 1}</span>
               </div>

               {/* Right Creative Element: Rotated Label + Line */}
               <div className="hidden xl:flex absolute -right-32 top-10 items-center gap-4 transition-transform duration-700 group-hover:translate-x-4 pointer-events-none">
                  <div className="w-16 h-[1px] bg-brand-600/30"></div>
                  <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-600 uppercase rotate-90 origin-left translate-y-[2px] whitespace-nowrap">
                     {index === 0 ? 'Starter' : index === 1 ? 'Most Popular' : 'Premium'}
                  </span>
               </div>

               {/* Card Content - Dark Theme */}
               <div className="p-10 md:p-14 border rounded-sm flex flex-col md:flex-row gap-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-zinc-900 border-zinc-800 text-white relative z-10">
                <div className="flex-1">
                  <h4 className="text-3xl font-serif mb-2 italic text-white">{pkg.name}</h4>
                  <p className="text-4xl font-light mb-6 text-brand-500">{pkg.price}</p>
                  <p className="text-lg leading-relaxed mb-8 text-zinc-400">{pkg.description}</p>
                  
                  <button 
                    onClick={() => onBook(pkg)}
                    className="w-full md:w-auto px-10 py-4 text-xs uppercase tracking-widest font-semibold transition-all bg-brand-600 text-white hover:bg-white hover:text-zinc-900 border border-transparent hover:border-white"
                  >
                    Book Collection
                  </button>
                </div>
                
                <div className="flex-1 border-t md:border-t-0 md:border-l pt-8 md:pt-0 md:pl-12 border-white/10 flex flex-col justify-center">
                  <h5 className="uppercase tracking-widest text-xs font-semibold mb-8 text-white opacity-80">What's Included</h5>
                  <ul className="space-y-5">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center transition-colors text-zinc-300 group-hover:text-white">
                        <span className="w-6 h-6 rounded-full bg-brand-900/50 flex items-center justify-center mr-4 border border-brand-500/20 group-hover:border-brand-500/50 transition-colors">
                            <Check className="w-3 h-3 text-brand-500" />
                        </span>
                        <span className="font-light tracking-wide">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;