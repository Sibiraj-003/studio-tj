import React from 'react';
import { Instagram, MessageCircle, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-900 py-16 border-t border-zinc-800">
      <div className="container mx-auto px-6 flex flex-col items-center">
        {/* Logo Container - White background to ensure logo visibility */}
        <div className="bg-white px-4 py-2 rounded-sm mb-8">
          <img 
            src="/logo.png" 
            alt="Stories by TJ" 
            className="h-12 w-auto object-contain"
            onError={(e) => {
                // Fallback text if image missing
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
           <div className="hidden text-2xl font-serif italic font-bold tracking-wider text-zinc-900">
            <span className="text-brand-600">STORIES</span> <span className="text-zinc-900 text-lg not-italic">by</span> <span className="text-brand-600">TJ</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <a 
            href="https://www.instagram.com/stories_by_tj/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <div className="p-2 rounded-full border border-zinc-700 group-hover:border-white group-hover:bg-zinc-800 transition-all">
                <Instagram className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-widest hidden md:block">Instagram</span>
          </a>
          
          <a 
            href="https://wa.me/917667279175" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <div className="p-2 rounded-full border border-zinc-700 group-hover:border-white group-hover:bg-zinc-800 transition-all">
                <MessageCircle className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-widest hidden md:block">WhatsApp</span>
          </a>

          <a 
            href="mailto:storiesbytj@digieratech.in"
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <div className="p-2 rounded-full border border-zinc-700 group-hover:border-white group-hover:bg-zinc-800 transition-all">
                <Mail className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-widest hidden md:block">Email</span>
          </a>

           <a 
            href="https://goo.gl/maps/otFCaoUzQprgQoP5A?g_st=aw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <div className="p-2 rounded-full border border-zinc-700 group-hover:border-white group-hover:bg-zinc-800 transition-all">
                <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs uppercase tracking-widest hidden md:block">Location</span>
          </a>
        </div>

        <div className="text-center text-zinc-600 text-sm font-light">
          <p className="mb-2">&copy; {new Date().getFullYear()} Stories by TJ. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;