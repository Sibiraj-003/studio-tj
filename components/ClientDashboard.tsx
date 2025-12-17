import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { 
  Calendar, Clock, MapPin, CheckCircle, AlertCircle, Image, 
  Download, ExternalLink, ChevronRight, X, Loader2, Camera
} from 'lucide-react';

interface ClientDashboardProps {
  user: { name: string; email: string };
  onBack: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, onBack }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery'>('overview');
  const [selectedGallery, setSelectedGallery] = useState<Booking | null>(null);

  useEffect(() => {
    const unsubscribe = api.subscribeClientBookings(user.email, (data) => {
        setBookings(data);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [user.email]);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'completed'); // Include completed in list until archived
  const deliveredBookings = bookings.filter(b => b.deliveryStatus === 'delivered');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  // Mock Photo Generation for Demo
  const getMockPhotos = (booking: Booking) => {
    const seed = booking.id.charCodeAt(0);
    const count = 12;
    const photos = [];
    const type = booking.eventType?.toLowerCase().includes('wedding') ? 'wedding' : 
                 booking.eventType?.toLowerCase().includes('fashion') ? 'fashion' : 'portrait';
    
    const bases = {
        wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552',
        fashion: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b',
        portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
    };

    for(let i=0; i<count; i++) {
        photos.push({
            id: i,
            url: `${bases[type]}?auto=format&fit=crop&w=800&q=80&sig=${seed + i}`,
            title: `Photo ${i + 1}`
        });
    }
    return photos;
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Welcome Header */}
        <div className="mb-12 animate-fade-in-up">
            <h6 className="text-brand-600 tracking-widest uppercase text-xs font-semibold mb-2">My Client Portal</h6>
            <h1 className="text-4xl md:text-5xl font-serif text-black mb-4">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-zinc-500 max-w-lg font-light">
                Manage your sessions, view invoice status, and access your private galleries all in one place.
            </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-zinc-200 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-sm tracking-widest uppercase font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-brand-600 text-black' : 'border-transparent text-zinc-400 hover:text-black'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('gallery')}
                className={`pb-4 text-sm tracking-widest uppercase font-medium transition-colors border-b-2 flex items-center space-x-2 ${activeTab === 'gallery' ? 'border-brand-600 text-black' : 'border-transparent text-zinc-400 hover:text-black'}`}
            >
                <span>My Galleries</span>
                {deliveredBookings.length > 0 && (
                    <span className="bg-brand-100 text-brand-700 text-[10px] px-1.5 py-0.5 rounded-full">{deliveredBookings.length}</span>
                )}
            </button>
        </div>

        {/* CONTENT AREA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                </div>
            ) : (
                <>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Upcoming / Active Bookings */}
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="font-serif text-xl italic text-black mb-4">Your Sessions</h3>
                                {upcomingBookings.length === 0 ? (
                                    <div className="bg-white p-8 border border-zinc-200 text-center rounded-sm">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-5 h-5 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-500">No active bookings found.</p>
                                        <button onClick={onBack} className="mt-4 text-brand-600 text-sm font-semibold uppercase tracking-wide hover:underline">
                                            Book a Session
                                        </button>
                                    </div>
                                ) : (
                                    upcomingBookings.map(booking => (
                                        <div key={booking.id} className="bg-white border border-zinc-200 p-6 rounded-sm shadow-sm relative overflow-hidden group">
                                            {/* Status Bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${booking.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'}`}></div>
                                            
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                                <div className="mb-4 md:mb-0 pl-2">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 border border-zinc-200 px-2 py-0.5 rounded-sm">
                                                            {booking.eventType}
                                                        </span>
                                                        {booking.status === 'completed' && (
                                                            <span className="flex items-center text-[10px] uppercase tracking-widest font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-xl font-serif text-black">{booking.packageName}</h4>
                                                    <div className="flex items-center text-zinc-500 text-sm mt-2">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        {formatDate(booking.date)}
                                                    </div>
                                                    <div className="flex items-center text-zinc-500 text-sm mt-1">
                                                        <MapPin className="w-4 h-4 mr-2" />
                                                        {booking.location}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end space-y-3 pl-2">
                                                     {/* Payment Status */}
                                                    <div className="flex items-center">
                                                        <span className="text-xs text-zinc-500 mr-2">Payment:</span>
                                                        {booking.paymentStatus === 'paid' ? (
                                                            <span className="text-xs font-bold text-green-600 uppercase flex items-center">
                                                                Paid <CheckCircle className="w-3 h-3 ml-1" />
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-bold text-amber-500 uppercase flex items-center">
                                                                {booking.price} Pending <Clock className="w-3 h-3 ml-1" />
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Delivery Status Action */}
                                                    {booking.deliveryStatus === 'delivered' ? (
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedGallery(booking);
                                                                setActiveTab('gallery');
                                                            }}
                                                            className="bg-black text-white px-5 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-brand-600 transition-colors flex items-center"
                                                        >
                                                            View Photos <ChevronRight className="w-3 h-3 ml-1" />
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center text-zinc-400 text-xs uppercase tracking-wide bg-zinc-50 px-3 py-1.5 rounded-sm">
                                                            <Camera className="w-3 h-3 mr-2" />
                                                            Editing in Progress
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-6">
                                <div className="bg-brand-50 p-6 border border-brand-100 rounded-sm">
                                    <h4 className="text-brand-800 font-serif text-lg italic mb-2">Studio News</h4>
                                    <p className="text-sm text-brand-900/70 leading-relaxed mb-4">
                                        Holiday mini-sessions are opening soon! Check your email for early access codes.
                                    </p>
                                </div>
                                <div className="bg-white p-6 border border-zinc-200 rounded-sm">
                                    <h4 className="font-serif text-lg italic mb-4">Quick Actions</h4>
                                    <ul className="space-y-3">
                                        <li>
                                            <a href="#" className="flex items-center text-sm text-zinc-600 hover:text-brand-600 transition-colors">
                                                <ExternalLink className="w-4 h-4 mr-2" /> Download Price List
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="flex items-center text-sm text-zinc-600 hover:text-brand-600 transition-colors">
                                                <ExternalLink className="w-4 h-4 mr-2" /> Styling Guide
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GALLERY TAB */}
                    {activeTab === 'gallery' && (
                        <div>
                             {selectedGallery ? (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-6">
                                        <button 
                                            onClick={() => setSelectedGallery(null)}
                                            className="text-zinc-500 hover:text-black flex items-center text-sm uppercase tracking-widest"
                                        >
                                            <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to List
                                        </button>
                                        <div className="flex items-center space-x-4">
                                            <button className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-sm text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                                                <Download className="w-4 h-4" /> <span>Download All</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-8 border-b border-zinc-200 pb-6">
                                        <h2 className="text-3xl font-serif text-black">{selectedGallery.packageName} Session</h2>
                                        <p className="text-zinc-500 mt-1">{formatDate(selectedGallery.date)} • {selectedGallery.location}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {getMockPhotos(selectedGallery).map((photo) => (
                                            <div key={photo.id} className="group relative aspect-[4/5] bg-zinc-100 overflow-hidden cursor-pointer">
                                                <img 
                                                    src={photo.url} 
                                                    alt={photo.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                                    <button className="p-2 bg-white rounded-full text-black hover:bg-brand-600 hover:text-white transition-colors" title="View">
                                                        <Image className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2 bg-white rounded-full text-black hover:bg-brand-600 hover:text-white transition-colors" title="Download">
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {deliveredBookings.length === 0 ? (
                                        <div className="col-span-full py-16 text-center border border-dashed border-zinc-300 rounded-sm">
                                            <Image className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-zinc-900">No Galleries Available</h3>
                                            <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                                                Once your session is complete and edited, your photos will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        deliveredBookings.map(booking => (
                                            <div 
                                                key={booking.id} 
                                                onClick={() => setSelectedGallery(booking)}
                                                className="group cursor-pointer bg-white border border-zinc-200 rounded-sm overflow-hidden hover:shadow-lg transition-all"
                                            >
                                                <div className="aspect-video bg-zinc-100 relative overflow-hidden">
                                                    {/* Cover Image Mock */}
                                                    <img 
                                                        src={getMockPhotos(booking)[0].url} 
                                                        alt="Gallery Cover" 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                    <div className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                                                        12 Photos
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h4 className="font-serif text-lg text-black group-hover:text-brand-600 transition-colors">
                                                        {booking.packageName}
                                                    </h4>
                                                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                                                        {formatDate(booking.date)}
                                                    </p>
                                                    <div className="mt-4 flex items-center text-xs font-bold text-brand-600 uppercase tracking-widest">
                                                        Open Gallery <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                             )}
                        </div>
                    )}
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;