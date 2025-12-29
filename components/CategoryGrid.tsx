import React from 'react';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    title: 'Engagement',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
    overlay: 'bg-zinc-600/60 mix-blend-multiply', 
    titleColor: 'text-white'
  },
  {
    id: 2,
    title: 'Wedding',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop',
    overlay: 'bg-zinc-500/50 mix-blend-multiply', 
    titleColor: 'text-white'
  },
  {
    id: 3,
    title: 'Baby Shower',
    image: 'https://images.unsplash.com/photo-1596386461350-326256f8e77e?q=80&w=600&auto=format&fit=crop',
    overlay: 'bg-rose-800/60 mix-blend-multiply', 
    titleColor: 'text-white'
  },
  {
    id: 4,
    title: 'Maternity',
    image: 'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?q=80&w=600&auto=format&fit=crop', 
    overlay: 'bg-slate-700/60 mix-blend-multiply', 
    titleColor: 'text-white'
  },
  {
    id: 5,
    title: 'Outdoor',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600&auto=format&fit=crop', 
    overlay: 'bg-zinc-600/40 mix-blend-multiply',
    titleColor: 'text-white'
  },
  {
    id: 6,
    title: 'Puberty',
    image: 'https://images.unsplash.com/photo-1627063539870-b8d4512e2307?q=80&w=600&auto=format&fit=crop',
    overlay: 'bg-zinc-500/50 mix-blend-multiply',
    titleColor: 'text-white'
  }
];

const CategoryGrid: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="relative h-72 md:h-80 lg:h-96 rounded-xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
            >
              <img 
                src={cat.image} 
                alt={cat.title} 
                loading="lazy"
                width="600"
                height="800"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 transition-opacity duration-300 ${cat.overlay} group-hover:opacity-90`}></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className={`text-3xl md:text-4xl font-sans font-bold mb-6 drop-shadow-md tracking-tight ${cat.titleColor}`}>
                  {cat.title}
                </h3>
                <div className="w-12 h-10 border border-white/60 rounded flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-white group-hover:text-black transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;