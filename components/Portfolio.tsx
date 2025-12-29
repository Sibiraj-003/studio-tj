import React, { useState, useEffect, useRef } from 'react';
import { NavLink, PhotoItem } from '../types';

const PolaroidCard: React.FC<{ photo: PhotoItem; rotation?: number }> = ({ photo, rotation = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate tilt (max 10 degrees)
    const xRot = ((y - rect.height / 2) / rect.height) * -10;
    const yRot = ((x - rect.width / 2) / rect.width) * 10;
    
    setTilt({ x: xRot, y: yRot });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 p-3 pb-8 w-[280px] md:w-[320px] shrink-0 mx-6 bg-white border border-zinc-200 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out group perspective-container"
        style={{ 
            transform: `rotate(${rotation}deg) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
            zIndex: tilt.x !== 0 ? 50 : 1
        }}
    >
      <div className="aspect-[4/5] bg-zinc-100 overflow-hidden relative mb-4">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        <img 
          src={photo.url} 
          alt={photo.title}
          className="w-full h-full object-cover filter saturate-[0.85] group-hover:saturate-100 contrast-125 transition-all duration-500 group-hover:scale-110"
        />
      </div>
      <div className="px-2 flex justify-between items-baseline border-b border-transparent group-hover:border-zinc-300 pb-2 transition-colors">
        <h4 className="font-serif italic text-black text-2xl font-medium">{photo.title}</h4>
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold group-hover:text-brand-600 transition-colors">{photo.category}</span>
      </div>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for fade-in animations of the header
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [filter]);

  const photos: PhotoItem[] = [
    { id: 1, url: '/Instapage/birthday.jpeg', category: 'Birthday', title: 'Birthday' },
    { id: 2, url: '/Instapage/kids.jpeg', category: 'portrait', title: 'Kids Potrait' },
    { id: 3, url: '/Instapage/babyshower.jpeg', category: 'Baby Shower', title: 'babyshower' },
    { id: 4, url: '/Instapage/familyphoto.jpeg', category: 'Family Photo', title: 'Family Photo' },
    { id: 5, url: '/Instapage/marriage.jpeg', category: 'Wedding', title: 'wedding' },
    { id: 6, url: '/Instapage/bride.jpeg', category: 'Bride', title: 'bride' },
    { id: 7, url: '/Instapage/marriage02.jpeg', category: 'Marriage', title: 'marriage' },
    { id: 8, url: '/Instapage/kids03.jpeg', category: 'wedding', title: 'Wedding' },
    { id: 9, url: '/Instapage/wedding03.jpeg', category: 'portrait', title: 'Soulful Eyes' },
    { id: 10, url: '/Instapage/kids.jpeg', category: 'fashion', title: 'Avant Garde' }, 
    { id: 11, url: '/Instapage/wedding04.jpeg', category: 'wedding', title: 'Candid Joy' },
    { id: 12, url: '/Instapage/groom.jpeg', category: 'portrait', title: 'Monochrome Dream' },
  ];

  const categories = ['all', 'portrait', 'wedding', 'fashion'];
  const filteredPhotos = filter === 'all' ? photos : photos.filter(p => p.category === filter);

  // Helper to ensure we have enough items for the marquee to scroll smoothly without gaps
  const getMarqueeItems = (items: PhotoItem[]) => {
    if (items.length === 0) return [];
    let result = [...items];
    while (result.length < 8) {
      result = [...result, ...items];
    }
    return [...result, ...result, ...result];
  };

  const marqueeItems = getMarqueeItems(filteredPhotos);
  const row1Items = marqueeItems;
  const row2Items = [...marqueeItems].reverse();

  return (
    <section id={NavLink.PORTFOLIO} ref={sectionRef} className="py-24 bg-zinc-50 relative z-20 overflow-hidden">
      
      {/* Decorative Text Behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5 pointer-events-none whitespace-nowrap select-none">
        <span className="text-[140px] md:text-[200px] font-serif font-bold text-zinc-900 leading-none">CAPTURED</span>
      </div>

      <div className="container mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row justify-between items-end reveal-on-scroll">
          <div className="mb-8 md:mb-0">
            <h2 className="text-brand-600 tracking-widest text-sm uppercase font-semibold mb-2">Selected Works</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-black">Visual Stories</h3>
            <div className="h-[1px] w-[55px] bg-[#C62828] mt-4"></div>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`uppercase text-xs tracking-[0.2em] transition-colors pb-1 border-b-2 font-medium ${
                  filter === cat 
                  ? 'text-black border-brand-600' 
                  : 'text-zinc-500 border-transparent hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="flex flex-col gap-12 relative py-8">
        
        {/* Row 1: Scroll Left */}
        <div className="relative w-full overflow-hidden group">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex w-max animate-scroll-left hover:[animation-play-state:paused] py-4">
                <div className="flex">
                    {row1Items.map((photo, index) => (
                        <PolaroidCard key={`r1-${index}`} photo={photo} rotation={index % 2 === 0 ? 2 : -2} />
                    ))}
                </div>
                <div className="flex">
                    {row1Items.map((photo, index) => (
                        <PolaroidCard key={`r1-dup-${index}`} photo={photo} rotation={index % 2 === 0 ? 2 : -2} />
                    ))}
                </div>
            </div>
        </div>

        {/* Row 2: Scroll Right */}
        <div className="relative w-full overflow-hidden group">
             <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none"></div>
             <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none"></div>

            <div className="flex w-max animate-scroll-right hover:[animation-play-state:paused] py-4">
                <div className="flex">
                    {row2Items.map((photo, index) => (
                        <PolaroidCard key={`r2-${index}`} photo={photo} rotation={index % 2 === 0 ? -1 : 3} />
                    ))}
                </div>
                <div className="flex">
                    {row2Items.map((photo, index) => (
                        <PolaroidCard key={`r2-dup-${index}`} photo={photo} rotation={index % 2 === 0 ? -1 : 3} />
                    ))}
                </div>
            </div>
        </div>

      </div>

    </section>
  );
};

export default Portfolio;