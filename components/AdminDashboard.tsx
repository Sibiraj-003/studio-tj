import React, { useEffect, useState } from 'react';
import { Booking, Inquiry } from '../types';
import { Calendar, User, DollarSign, Search, AlertCircle, Eye, CheckCircle, Clock, CreditCard, X, MapPin, Phone, Mail, Camera, Wifi, WifiOff, XCircle, Image, RefreshCw, Trash2, Check, MessageSquare, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'inquiries'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [visits, setVisits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyBookings: 0,
    completedEvents: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    // 1. Subscribe to Real-Time Bookings
    const unsubscribeBookings = api.subscribeBookings((updatedBookings) => {
        setBookings(updatedBookings);
        calculateStats(updatedBookings);
        setIsCloud(api.getConnectionStatus()); // Update connection status
        
        // Update selectedBooking if it's currently open (to reflect real-time changes)
        setSelectedBooking(prev => {
            if (!prev) return null;
            // If the selected booking is no longer in the list (deleted remotely), close modal
            const exists = updatedBookings.find(b => b.id === prev.id);
            if (!exists) return null;
            return exists;
        });

        setLoading(false);
    });

    // 2. Subscribe to Inquiries
    const unsubscribeInquiries = api.subscribeInquiries((updatedInquiries) => {
        setInquiries(updatedInquiries);
    });

    // 3. Load Visits (Once)
    const loadVisits = async () => {
        const v = await api.getVisits();
        setVisits(v);
    };
    loadVisits();

    // Cleanup subscription on unmount
    return () => {
        unsubscribeBookings();
        unsubscribeInquiries();
    };
  }, []);

  const calculateStats = (data: Booking[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Revenue: Exclude cancelled events
    const validBookings = data.filter(b => b.status !== 'cancelled');
    const revenue = validBookings.reduce((acc, curr) => acc + parseInt(curr.price.replace(/[^0-9]/g, '') || '0'), 0);
    
    // Events booked for THIS month (excluding cancelled)
    const thisMonth = validBookings.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Events marked as completed
    const completed = data.filter(b => b.status === 'completed').length;

    // Payments pending (excluding cancelled)
    const pending = validBookings.filter(b => b.paymentStatus === 'pending').length;

    setStats({
        totalRevenue: revenue,
        monthlyBookings: thisMonth,
        completedEvents: completed,
        pendingPayments: pending
    });
  };

  const formatDate = (dateString: string | number) => {
    if (!dateString) return 'Date Pending';
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // --- ACTIONS ---

  const updateStatus = async (id: string, newStatus: Booking['status']) => {
    await api.updateBooking(id, { status: newStatus });
  };

  const updatePayment = async (id: string, newStatus: Booking['paymentStatus']) => {
    await api.updateBooking(id, { paymentStatus: newStatus });
  };

  const updateDelivery = async (id: string, newStatus: 'delivered' | 'processing') => {
      await api.updateBooking(id, { deliveryStatus: newStatus });
  };

  const handleDeleteBooking = async (id: string) => {
      if (window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
          // 1. Optimistic Update: Immediately remove from UI to make it feel responsive
          setBookings(prev => prev.filter(b => b.id !== id));
          if (selectedBooking?.id === id) {
              setSelectedBooking(null);
          }
          
          // 2. Call API
          try {
             await api.deleteBooking(id);
             // Note: The subscription will fire again with the server state eventually.
             // If delete succeeds, the server state will match our optimistic state.
          } catch (error) {
             console.error("Delete failed", error);
             alert("Failed to delete booking. Please try again.");
             // In a real app, we might revert the state here by re-fetching
          }
      }
  };

  const handleMarkInquiryRead = async (id: string) => {
      await api.markInquiryRead(id);
  };


  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 animate-fade-in-up">
          <div>
            <h6 className="text-brand-600 tracking-widest uppercase text-xs font-semibold mb-2">Studio Management</h6>
            <h1 className="text-4xl md:text-5xl font-serif text-black">Dashboard</h1>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
             {/* Connection Status Indicator */}
             <div className={`hidden md:flex items-center space-x-2 px-3 py-1 rounded-full border transition-colors ${isCloud ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                {isCloud ? (
                    <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">Cloud Active</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Offline Mode</span>
                    </>
                )}
             </div>
             
             <div className="bg-white border border-zinc-200 px-4 py-2 flex items-center space-x-2 rounded-sm shadow-sm">
                <Search className="w-4 h-4 text-zinc-400" />
                <input type="text" placeholder="Search..." className="outline-none text-sm w-48" />
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* VISITS CARD */}
          <div className="bg-white p-6 border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Total Visits</p>
              <p className="text-3xl font-serif text-black">{visits.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-zinc-600" />
            </div>
          </div>

          {/* MONTHLY EVENTS CARD */}
          <div className="bg-white p-6 border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Events This Month</p>
              <p className="text-3xl font-serif text-black">{stats.monthlyBookings}</p>
            </div>
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-600" />
            </div>
          </div>

          {/* COMPLETED EVENTS CARD */}
          <div className="bg-white p-6 border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
             <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Events Finished</p>
              <p className="text-3xl font-serif text-black">{stats.completedEvents}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* PAYMENT/REVENUE CARD */}
          <div className="bg-white p-6 border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between">
             <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">Total Revenue</p>
              <p className="text-3xl font-serif text-black">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex space-x-8 border-b border-zinc-200 mb-8 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <button 
                onClick={() => setActiveTab('bookings')}
                className={`pb-4 text-sm tracking-widest uppercase font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'bookings' ? 'border-brand-600 text-black' : 'border-transparent text-zinc-400 hover:text-black'}`}
            >
                <Calendar className="w-4 h-4" />
                Bookings
                <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-full text-[10px]">{bookings.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('inquiries')}
                className={`pb-4 text-sm tracking-widest uppercase font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'inquiries' ? 'border-brand-600 text-black' : 'border-transparent text-zinc-400 hover:text-black'}`}
            >
                <MessageSquare className="w-4 h-4" />
                Messages
                {inquiries.filter(i => !i.read).length > 0 && (
                     <span className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{inquiries.filter(i => !i.read).length} New</span>
                )}
            </button>
        </div>


        {/* MAIN CONTENT AREA */}
        <div className="bg-white border border-zinc-200 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            
            {/* BOOKINGS TABLE */}
            {activeTab === 'bookings' && (
                <>
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="font-serif text-xl italic text-zinc-800">Booking Overview</h3>
                    <div className="text-xs text-zinc-500 font-medium">
                        {stats.pendingPayments} Payment(s) Pending
                    </div>
                </div>
              
              {bookings.length === 0 ? (
                <div className="p-16 text-center">
                    <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-serif text-zinc-800 mb-2">
                        {loading ? 'Loading Bookings...' : 'No Bookings Yet'}
                    </h3>
                    <p className="text-zinc-500 max-w-sm mx-auto">When clients book a package, their details will appear here automatically.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Client</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Event / Package</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Date</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Status</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Payment</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase">Delivery</th>
                        <th className="p-4 md:p-6 text-xs font-semibold tracking-widest text-zinc-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-zinc-50 transition-colors group">
                          <td className="p-4 md:p-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-black text-sm">{booking.clientName}</p>
                                    <div className="flex items-center text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">
                                        {booking.clientEmail}
                                    </div>
                                </div>
                            </div>
                          </td>
                          <td className="p-4 md:p-6">
                            <div className="font-medium text-sm text-black">{booking.eventType || 'Photo Session'}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-zinc-200">
                                {booking.packageName}
                            </span>
                          </td>
                          <td className="p-4 md:p-6">
                            <div className="flex items-center text-zinc-700 text-sm font-medium">
                                {formatDate(booking.date)}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {booking.location || 'TBD'}
                            </div>
                          </td>
                          
                          {/* Event Status Dropdown/Display */}
                          <td className="p-4 md:p-6">
                             <div className="relative inline-block text-left">
                                {booking.status === 'completed' ? (
                                    <div className="flex items-center space-x-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit border border-green-100">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Attended</span>
                                    </div>
                                ) : booking.status === 'cancelled' ? (
                                    <div className="flex items-center space-x-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full w-fit border border-red-100">
                                        <XCircle className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Cancelled</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1.5 text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-100">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">Upcoming</span>
                                    </div>
                                )}
                             </div>
                          </td>

                          {/* Payment Status Toggle */}
                          <td className="p-4 md:p-6 cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); updatePayment(booking.id, booking.paymentStatus === 'paid' ? 'pending' : 'paid'); }}>
                             {booking.paymentStatus === 'paid' ? (
                                <div className="flex items-center space-x-1.5 text-zinc-700 hover:text-green-600 transition-colors">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-xs font-medium">Paid</span>
                                </div>
                             ) : (
                                <div className="flex items-center space-x-1.5 text-zinc-700 hover:text-amber-600 transition-colors">
                                    <CreditCard className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-medium">Pending</span>
                                </div>
                             )}
                          </td>

                          {/* Delivery Status (New Column) */}
                          <td className="p-4 md:p-6 cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); updateDelivery(booking.id, booking.deliveryStatus === 'delivered' ? 'processing' : 'delivered'); }}>
                             {booking.deliveryStatus === 'delivered' ? (
                                <div className="flex items-center space-x-1.5 text-purple-700">
                                    <Image className="w-4 h-4" />
                                    <span className="text-xs font-medium">Delivered</span>
                                </div>
                             ) : (
                                 <div className="flex items-center space-x-1.5 text-zinc-400">
                                    <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                    <span className="text-xs font-medium">Processing</span>
                                </div>
                             )}
                          </td>

                          <td className="p-4 md:p-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                 <button 
                                    className="text-xs font-semibold uppercase tracking-wider text-brand-600 hover:text-brand-800 transition-colors bg-brand-50 px-3 py-1.5 rounded-sm"
                                    onClick={() => setSelectedBooking(booking)}
                                 >
                                    Details
                                 </button>
                                 <button
                                    className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors rounded-sm hover:bg-red-50"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}
                                    title="Delete Booking"
                                 >
                                     <Trash2 className="w-4 h-4" />
                                 </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </>
            )}

            {/* INQUIRIES LIST */}
            {activeTab === 'inquiries' && (
                <>
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                        <h3 className="font-serif text-xl italic text-zinc-800">Inbox</h3>
                        <div className="text-xs text-zinc-500 font-medium">
                            Direct messages from contact form
                        </div>
                    </div>
                    {inquiries.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-serif text-zinc-800 mb-2">No Messages</h3>
                            <p className="text-zinc-500 max-w-sm mx-auto">Inquiries from the contact page will appear here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {inquiries.map((inquiry) => (
                                <div key={inquiry.id} className={`p-6 hover:bg-zinc-50 transition-colors flex flex-col md:flex-row gap-6 ${!inquiry.read ? 'bg-blue-50/30' : ''}`} onClick={() => !inquiry.read && handleMarkInquiryRead(inquiry.id)}>
                                    <div className="flex-shrink-0 flex flex-col items-center md:items-start min-w-[150px]">
                                        <span className={`text-xs uppercase tracking-widest font-bold mb-1 ${!inquiry.read ? 'text-brand-600' : 'text-zinc-500'}`}>
                                            {!inquiry.read ? '• New Message' : 'Read'}
                                        </span>
                                        <div className="font-medium text-black">{inquiry.name}</div>
                                        <div className="text-xs text-zinc-500">{inquiry.email}</div>
                                        <div className="text-[10px] text-zinc-400 mt-2">{formatDate(inquiry.createdAt)}</div>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                                            {inquiry.message}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-start justify-end">
                                        <a href={`mailto:${inquiry.email}`} className="text-xs font-bold uppercase tracking-wide text-brand-600 hover:underline flex items-center">
                                            <Mail className="w-3 h-3 mr-1" /> Reply
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

        </div>

        {/* DETAILS MODAL */}
        {selectedBooking && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
                <div className="bg-white w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex justify-between items-start shrink-0">
                        <div>
                            <h3 className="font-serif text-2xl text-black">Booking Details</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">ID: {selectedBooking.id.slice(0, 8)}</p>
                        </div>
                        <button onClick={() => setSelectedBooking(null)} className="text-zinc-400 hover:text-black">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-8 overflow-y-auto">
                        
                        {/* Client Info Section */}
                        <div className="flex items-start space-x-4 pb-6 border-b border-zinc-100">
                             <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 shrink-0">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-black">{selectedBooking.clientName}</h4>
                                <div className="space-y-1 mt-1">
                                    <div className="flex items-center text-sm text-zinc-600">
                                        <Mail className="w-3 h-3 mr-2 text-zinc-400" />
                                        {selectedBooking.clientEmail}
                                    </div>
                                    <div className="flex items-center text-sm text-zinc-600">
                                        <Phone className="w-3 h-3 mr-2 text-zinc-400" />
                                        {selectedBooking.clientPhone || 'No phone provided'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Event Type</p>
                                <div className="flex items-center text-zinc-800">
                                    <Camera className="w-4 h-4 mr-2 text-brand-600" />
                                    {selectedBooking.eventType || 'N/A'}
                                </div>
                            </div>
                             <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Package</p>
                                <div className="text-zinc-800 font-medium">
                                    {selectedBooking.packageName}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Date</p>
                                <div className="flex items-center text-zinc-800">
                                    <Calendar className="w-4 h-4 mr-2 text-brand-600" />
                                    {formatDate(selectedBooking.date)}
                                </div>
                            </div>
                             <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-1">Location</p>
                                <div className="flex items-center text-zinc-800">
                                    <MapPin className="w-4 h-4 mr-2 text-brand-600" />
                                    {selectedBooking.location || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* QUICK ACTIONS SECTION (UPDATED) */}
                        <div className="bg-zinc-50 p-6 border border-zinc-100 rounded-sm space-y-6">
                             <h4 className="text-xs uppercase tracking-widest text-zinc-500 font-bold border-b border-zinc-200 pb-2">Management Actions</h4>
                             
                             {/* Action 1: Event Status */}
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-800">Event Status</p>
                                    <p className="text-xs text-zinc-500">Current: <span className="uppercase">{selectedBooking.status}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    {selectedBooking.status !== 'completed' && (
                                        <button 
                                            onClick={() => updateStatus(selectedBooking.id, 'completed')}
                                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                                        >
                                            <Check className="w-3 h-3" /> Attended
                                        </button>
                                    )}
                                    {selectedBooking.status === 'completed' && (
                                        <button 
                                            onClick={() => updateStatus(selectedBooking.id, 'upcoming')}
                                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                                        >
                                            <RefreshCw className="w-3 h-3" /> Reopen
                                        </button>
                                    )}
                                    {selectedBooking.status !== 'cancelled' && (
                                        <button 
                                            onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                                            className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1"
                                        >
                                            <XCircle className="w-3 h-3" /> Cancel
                                        </button>
                                    )}
                                </div>
                             </div>

                             {/* Action 2: Payment */}
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-800">Payment ({selectedBooking.price})</p>
                                    <p className="text-xs text-zinc-500">Current: <span className={selectedBooking.paymentStatus === 'paid' ? 'text-green-600 uppercase' : 'text-amber-500 uppercase'}>{selectedBooking.paymentStatus}</span></p>
                                </div>
                                <button 
                                    onClick={() => updatePayment(selectedBooking.id, selectedBooking.paymentStatus === 'paid' ? 'pending' : 'paid')}
                                    className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1 border ${selectedBooking.paymentStatus === 'paid' ? 'bg-white border-zinc-300 text-zinc-500 hover:bg-zinc-100' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}
                                >
                                    {selectedBooking.paymentStatus === 'paid' ? (
                                        <>Mark Pending</>
                                    ) : (
                                        <>Mark Received</>
                                    )}
                                </button>
                             </div>

                             {/* Action 3: Photo Delivery */}
                             <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-800">Photos & Gallery</p>
                                    <p className="text-xs text-zinc-500">Current: <span className={selectedBooking.deliveryStatus === 'delivered' ? 'text-purple-600 uppercase' : 'text-zinc-500 uppercase'}>{selectedBooking.deliveryStatus || 'Processing'}</span></p>
                                </div>
                                <button 
                                    onClick={() => updateDelivery(selectedBooking.id, selectedBooking.deliveryStatus === 'delivered' ? 'processing' : 'delivered')}
                                    className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wide flex items-center gap-1 border ${selectedBooking.deliveryStatus === 'delivered' ? 'bg-white border-zinc-300 text-zinc-500 hover:bg-zinc-100' : 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700'}`}
                                >
                                    {selectedBooking.deliveryStatus === 'delivered' ? (
                                        <>Mark Processing</>
                                    ) : (
                                        <>Mark Delivered</>
                                    )}
                                </button>
                             </div>
                        </div>

                        {/* Notes */}
                        {selectedBooking.notes && (
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-2">Client Notes</p>
                                <div className="bg-zinc-50 p-4 text-sm text-zinc-600 italic border border-zinc-100 rounded-sm">
                                    "{selectedBooking.notes}"
                                </div>
                            </div>
                        )}

                        {/* Delete Zone */}
                        <div className="border-t border-red-100 pt-6">
                            <button 
                                onClick={() => handleDeleteBooking(selectedBooking.id)}
                                className="w-full text-red-600 hover:bg-red-50 py-3 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors border border-red-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Booking Permanently</span>
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;