import React, { useState, useEffect, useRef } from 'react';
import { NavLink, AiConceptResult } from '../types';
import { generatePhotoConcept } from '../services/geminiService';
import { Sparkles, Loader2, Camera, Shirt, Lightbulb, Film } from 'lucide-react';

const AiAssistant: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState<AiConceptResult | null>(null);
  
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax Logic for Floating Shapes
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (shape1Ref.current) {
        shape1Ref.current.style.transform = `translate3d(0, ${scrollY * -0.1}px, 0) rotate(${scrollY * 0.05}deg)`;
      }
      if (shape2Ref.current) {
        shape2Ref.current.style.transform = `translate3d(0, ${scrollY * 0.05}px, 0) rotate(${scrollY * -0.02}deg)`;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    setLoading(true);
    setConcept(null);
    const result = await generatePhotoConcept(idea);
    setConcept(result);
    setLoading(false);
  };

  return (
    <section id={NavLink.AI_ADVISOR} className="py-24 bg-white border-y border-zinc-100 relative overflow-hidden">
      
      {/* Decorative Text Behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5 pointer-events-none whitespace-nowrap select-none">
        <span className="text-[140px] md:text-[200px] font-serif font-bold text-zinc-900 leading-none">CREATIVE</span>
      </div>

      {/* Parallax Abstract Shapes */}
      <div 
        ref={shape1Ref}
        className="absolute -top-20 -right-20 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl pointer-events-none will-change-transform"
      />
      <div 
        ref={shape2Ref}
        className="absolute top-40 -left-20 w-72 h-72 bg-zinc-200/50 rounded-full blur-3xl pointer-events-none will-change-transform"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Input Section */}
          <div className="reveal-on-scroll">
            <div className="flex items-center space-x-2 mb-6 text-brand-600">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm tracking-widest uppercase font-semibold">AI Creative Director</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight">
              Can't decide on a <span className="italic text-brand-600">Concept?</span>
            </h2>
            <div className="h-[1px] w-[55px] bg-[#C62828] mb-8"></div>
            
            <p className="text-zinc-800 mb-10 leading-relaxed text-lg font-light">
              Powered by Google Gemini, our virtual creative director helps you brainstorm themes, lighting, and styling for your next shoot. Describe your vision, and we'll refine it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g., A vintage 1920s jazz club vibe with dramatic shadows..."
                  className="w-full bg-zinc-50 border border-zinc-300 text-black p-6 rounded-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 outline-none min-h-[120px] resize-none transition-all duration-300 relative z-20 placeholder:text-zinc-500 font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !idea.trim()}
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 font-medium tracking-widest uppercase transition-all w-full flex justify-center items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 duration-200 shadow-[0_10px_25px_rgba(220,38,38,0.2)] hover:shadow-[0_15px_30px_rgba(220,38,38,0.3)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Dreaming...</span>
                  </>
                ) : (
                  <span>Generate Concept</span>
                )}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="bg-zinc-900 p-8 md:p-12 border border-zinc-800 min-h-[500px] flex flex-col justify-center relative overflow-hidden reveal-on-scroll shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-sm text-white" style={{ transitionDelay: '200ms' }}>
            {!concept && !loading && (
              <div className="text-center text-zinc-600 flex flex-col items-center">
                <Camera className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-serif text-2xl italic text-zinc-500">Your vision awaits...</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <div className="inline-block w-12 h-12 border-4 border-zinc-700 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-brand-500 tracking-widest text-xs uppercase animate-pulse">Consulting Creative Director...</p>
                </div>
              </div>
            )}

            {concept && (
              <div className="space-y-8 animate-fade-in-up">
                <div>
                  <h3 className="text-3xl font-serif text-white italic mb-2">{concept.title}</h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">{concept.mood}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 text-brand-500 mb-3 border-b border-zinc-700 pb-2">
                      <Shirt className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-widest">Wardrobe</span>
                    </div>
                    <ul className="text-sm text-zinc-300 space-y-2">
                      {concept.wardrobe.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 text-zinc-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 text-brand-500 mb-3 border-b border-zinc-700 pb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-widest">Lighting</span>
                    </div>
                    <p className="text-sm text-zinc-300">{concept.lighting}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-brand-500 mb-3 border-b border-zinc-700 pb-2">
                    <Film className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">Shot List</span>
                  </div>
                  <ul className="text-sm text-zinc-300 space-y-2">
                    {concept.shotList.slice(0, 3).map((shot, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-brand-600 font-serif italic">{i + 1}.</span>
                        {shot}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AiAssistant;