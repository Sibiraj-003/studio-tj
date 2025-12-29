import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Check, Loader2, User, Phone, Mail, MapPin, Camera } from 'lucide-react';
import { ServicePackage } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: ServicePackage | null;
  currentUser: { name: string; email: string } | null;
  onConfirm: (details: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, selectedPackage, currentUser, onConfirm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !selectedPackage) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
        onConfirm(formData);
        setIsSubmitting(false);
        // Reset non-user fields
        setFormData(prev => ({ ...prev, phone: '', eventType: '', date: '', location: '', notes: '' }));
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[95vh] rounded-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
          <div>
            <h3 className="font-serif text-2xl text-black italic">Reserve Your Session</h3>
            <p className="text-zinc-500 text-sm mt-1">Package: <span className="font-semibold text-brand-600">{selectedPackage.name}</span> <span className="text-zinc-300 mx-2">|</span> {selectedPackage.price}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="text" 
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="email" 
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Type of Event</label>
                    <div className="relative">
                        <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <select 
                            name="eventType"
                            required
                            value={formData.eventType}
                            onChange={handleChange}
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors appearance-none"
                        >
                            <option value="">Select Event Type</option>
                            <option value="Portrait Session">Portrait Session</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Engagement">Engagement</option>
                            <option value="Fashion Editorial">Fashion Editorial</option>
                            <option value="Family">Family</option>
                            <option value="Event Coverage">Event Coverage</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Preferred Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="date" 
                            name="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Location</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="text" 
                            name="location"
                            required
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Studio, Beach, City Center..."
                            className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest text-zinc-700 font-semibold">Special Requests / Vision</label>
                <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                    <textarea 
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Tell us about your vision, style preferences, or any specific shots you need..."
                        className="w-full bg-zinc-50 border border-zinc-300 text-black pl-12 pr-4 py-3 focus:border-brand-600 outline-none transition-colors resize-none"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 uppercase tracking-widest font-semibold hover:bg-brand-600 transition-all flex items-center justify-center space-x-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg"
            >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <span>Confirm Booking</span>
                        <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;