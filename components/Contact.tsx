import React, { useState, useEffect } from 'react';
import { NavLink } from '../types';
import { Send, MapPin, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;

    setIsSubmitting(true);
    await api.submitInquiry(formState);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState({ name: '', email: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section id={NavLink.CONTACT} className="py-24 bg-zinc-900 relative overflow-hidden text-white">
      
      {/* Decorative Text Behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.03] pointer-events-none whitespace-nowrap select-none">
        <span className="text-[140px] md:text-[200px] font-serif font-bold text-white leading-none">GET IN TOUCH</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="reveal-on-scroll">
            <h2 className="text-brand-600 tracking-widest text-sm uppercase font-semibold mb-3">Get in Touch</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-white mb-6">Let's Create Together</h3>
            <div className="h-[1px] w-[55px] bg-[#C62828] mb-8"></div>
            <p className="text-zinc-400 font-light mb-12 max-w-md leading-relaxed text-lg">
              We accept a limited number of commissions per year to ensure the highest quality of service. Tell us about your project.
            </p>

            <div className="space-y-8">
              <div className="flex items-start group">
                <a 
                    href="https://goo.gl/maps/otFCaoUzQprgQoP5A?g_st=aw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mr-4 group-hover:bg-brand-900/30 transition-colors shrink-0"
                >
                    <MapPin className="w-5 h-5 text-brand-500" />
                </a>
                <div>
                  <h4 className="text-white text-lg font-medium mb-1">Studio Location</h4>
                  <a 
                    href="https://maps.app.goo.gl/3NbdBU638Ghcg4W48" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zinc-400 font-light hover:text-brand-500 transition-colors"
                  >
                    Nagercoil, Tamil Nadu<br/>
                    <span className="text-xs uppercase tracking-widest border-b border-zinc-600 pb-0.5">View on Google Maps</span>
                  </a>
                </div>
              </div>
              <div className="flex items-start group">
                <a href="mailto:storiesbytj@digieratech.in" className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mr-4 group-hover:bg-brand-900/30 transition-colors shrink-0">
                    <Mail className="w-5 h-5 text-brand-500" />
                </a>
                <div>
                  <h4 className="text-white text-lg font-medium mb-1">Email</h4>
                  <a href="mailto:storiesbytj@digieratech.in" className="text-zinc-400 font-light hover:text-brand-500 transition-colors">storiesbytj@digieratech.in</a>
                </div>
              </div>
              <div className="flex items-start group">
                <a href="tel:+917667279175" className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mr-4 group-hover:bg-brand-900/30 transition-colors shrink-0">
                    <Phone className="w-5 h-5 text-brand-500" />
                </a>
                <div>
                  <h4 className="text-white text-lg font-medium mb-1">Phone</h4>
                  <a href="tel:+917667279175" className="text-zinc-400 font-light hover:text-brand-500 transition-colors">+91 76672 79175</a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-zinc-800/50 backdrop-blur-sm p-8 md:p-12 border border-zinc-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.3)] reveal-on-scroll rounded-sm relative" style={{ transitionDelay: '200ms' }}>
            
            {isSuccess ? (
                <div className="absolute inset-0 z-20 bg-zinc-800 flex flex-col items-center justify-center text-center p-8 animate-fade-in-up">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h4 className="text-2xl font-serif text-white mb-2">Message Sent</h4>
                    <p className="text-zinc-400">Thank you for reaching out. We will respond within 24 hours.</p>
                    <button 
                        onClick={() => setIsSuccess(false)}
                        className="mt-6 text-xs uppercase tracking-widest text-brand-500 hover:text-brand-400 font-bold"
                    >
                        Send Another
                    </button>
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className={`space-y-6 ${isSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 group-focus-within:text-brand-500 font-semibold mb-2 transition-colors">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border-b border-zinc-600 text-white p-3 focus:border-brand-600 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="Your Name"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs uppercase tracking-widest text-zinc-500 group-focus-within:text-brand-500 font-semibold mb-2 transition-colors">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-zinc-900/50 border-b border-zinc-600 text-white p-3 focus:border-brand-600 outline-none transition-all placeholder:text-zinc-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 group-focus-within:text-brand-500 font-semibold mb-2 transition-colors">Message</label>
                <textarea 
                  name="message"
                  required
                  rows={4}
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full bg-zinc-900/50 border-b border-zinc-600 text-white p-3 focus:border-brand-600 outline-none transition-all resize-none placeholder:text-zinc-700"
                  placeholder="Tell us about your vision..."
                ></textarea>
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full bg-white text-black py-4 uppercase tracking-widest font-semibold hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center space-x-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;