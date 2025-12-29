import React, { useState } from 'react';
import { NavLink } from '../types';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeLink: string;
  scrollToSection: (sectionId: string) => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onDashboardClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeLink, scrollToSection, onLoginClick, onLogoutClick, isLoggedIn, isAdmin, onDashboardClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navLinks = [
    { id: NavLink.HOME, label: 'Home' },
    { id: NavLink.PORTFOLIO, label: 'Portfolio' },
    { id: NavLink.AI_ADVISOR, label: 'AI Director' },
    { id: NavLink.SERVICES, label: 'Services' },
    { id: NavLink.CONTACT, label: 'Contact' },
  ];

  const handleAuthClick = () => {
    if (isLoggedIn) {
      onLogoutClick();
    } else {
      onLoginClick();
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md py-3 border-b border-zinc-100 shadow-sm`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => scrollToSection(NavLink.HOME)}
        >
          {/* Logo Image - Expects 'logo.png' in the public folder */}
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
          {/* Fallback Text Logo */}
          <div className="hidden text-2xl font-serif italic font-bold tracking-wider text-black">
            <span className="text-brand-600">STORIES</span> <span className="text-black text-lg not-italic">by</span> <span className="text-brand-600">TJ</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`text-sm tracking-widest uppercase transition-colors duration-300 hover:text-brand-600 ${activeLink === link.id ? 'text-brand-600 font-medium' : 'text-zinc-800 font-medium'}`}
            >
              {link.label}
            </button>
          ))}
          
          <div className="h-4 w-px mx-4 bg-zinc-300"></div>

          {/* Show Dashboard/Portal for Logged In Users */}
          {isLoggedIn && (
            <button 
              onClick={onDashboardClick}
              className="flex items-center space-x-2 text-sm tracking-widest uppercase text-brand-600 hover:text-brand-800 transition-colors font-bold mr-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isAdmin ? 'Dashboard' : 'My Portal'}</span>
            </button>
          )}

          <button 
            onClick={handleAuthClick}
            className="flex items-center space-x-2 text-sm tracking-widest uppercase text-black hover:text-brand-600 transition-colors border border-zinc-300 hover:border-brand-600 px-4 py-2 rounded-sm font-medium"
          >
            {isLoggedIn ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />}
            <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden hover:text-brand-600 transition-colors text-black"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-100 transition-all duration-300 overflow-hidden shadow-xl ${isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col p-6 space-y-4">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                scrollToSection(link.id);
                setIsMenuOpen(false);
              }}
              className={`text-left text-sm tracking-widest uppercase py-2 ${activeLink === link.id ? 'text-brand-600 font-medium' : 'text-zinc-800'}`}
            >
              {link.label}
            </button>
          ))}
          
          {isLoggedIn && (
            <button 
              onClick={() => {
                  onDashboardClick();
                  setIsMenuOpen(false);
              }}
              className="text-left text-sm tracking-widest uppercase py-2 text-brand-600 font-bold flex items-center space-x-2"
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>{isAdmin ? 'Dashboard' : 'My Portal'}</span>
            </button>
          )}

          <div className="border-t border-zinc-100 pt-4 mt-2">
            <button 
                onClick={handleAuthClick}
                className="flex items-center space-x-2 text-sm tracking-widest uppercase text-black hover:text-brand-600 w-full text-left"
            >
                {isLoggedIn ? <LogOut className="w-4 h-4" /> : <User className="w-4 h-4" />}
                <span>{isLoggedIn ? 'Logout' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;