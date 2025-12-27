import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface AuthPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

// Declare google namespace for TypeScript
declare const google: any;

const GOOGLE_CLIENT_ID = "850892213850-mldnr6ii02hbsta3u3hadsmfqna2nmrs.apps.googleusercontent.com";

const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLoginSuccess }) => {
  const [view, setView] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD'>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  
  // Use a ref for the Google button container to calculate width dynamically
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [resetEmail, setResetEmail] = useState('');

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;

  // Helper to decode Google JWT
  const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
  };

  const handleGoogleCallback = async (response: any) => {
      setIsLoading(true);
      setError(null);
      const userObject = decodeJwt(response.credential);
      
      if (userObject) {
          try {
            // Use API Service
            const user = await api.googleAuth(userObject.name, userObject.email);
            
            // Set Session
            localStorage.setItem('tj_studio_current_user', JSON.stringify(user));
            
            onLoginSuccess();
          } catch (err) {
              console.error("Error during Google Auth processing", err);
              setError("An error occurred during authentication.");
          } finally {
              setIsLoading(false);
          }
      } else {
          setIsLoading(false);
          setError("Google Authentication failed. Invalid token.");
      }
  };

  // Check for Google Script Load
  useEffect(() => {
    if (typeof google !== 'undefined') {
      setIsGoogleScriptLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
          setIsGoogleScriptLoaded(true);
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialization for Real Google Sign-In
  useEffect(() => {
    if (CLIENT_ID && isGoogleScriptLoaded && view !== 'FORGOT_PASSWORD' && googleBtnRef.current) {
        try {
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: true,
                context: view === 'LOGIN' ? 'signin' : 'signup'
            });
            
            // Clear previous button content
            googleBtnRef.current.innerHTML = '';
            
            // Get exact container width to ensure full-width rendering (subtracting border/padding adjustments if needed, but clientWidth should work)
            const containerWidth = googleBtnRef.current.clientWidth;
            
            google.accounts.id.renderButton(
                googleBtnRef.current,
                { 
                    theme: "outline", 
                    size: "large", 
                    width: containerWidth, 
                    text: view === 'LOGIN' ? "signin_with" : "signup_with",
                    logo_alignment: "left",
                    shape: "pill"
                } 
            );
        } catch (error) {
            console.error("Error initializing Google Sign-In", error);
        }
    }
  }, [view, CLIENT_ID, isGoogleScriptLoaded]);


  const handleLogin = async () => {
    try {
        const user = await api.login(formData.email, formData.password);
        localStorage.setItem('tj_studio_current_user', JSON.stringify(user));
        onLoginSuccess();
    } catch (err: any) {
        setError(err.message || "Login failed.");
    }
  };

  const handleSignup = async () => {
    try {
        const user = await api.register(formData.name, formData.email, formData.password);
        localStorage.setItem('tj_studio_current_user', JSON.stringify(user));
        onLoginSuccess();
    } catch (err: any) {
        setError(err.message || "Registration failed.");
    }
  };

  const handleForgotPassword = () => {
    if (!resetEmail) {
        setError("Please enter your email address.");
        return;
    }
    // Simulation
    setSuccessMsg(`If an account exists for ${resetEmail}, a reset link has been sent.`);
    setResetEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    // Strict Client-Side Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailToCheck = view === 'FORGOT_PASSWORD' ? resetEmail : formData.email;

    if (!emailRegex.test(emailToCheck)) {
        setIsLoading(false);
        setError("Please enter a valid email address.");
        return;
    }
    
    try {
        if (view === 'LOGIN') {
            await handleLogin();
        } else if (view === 'SIGNUP') {
            await handleSignup();
        } else if (view === 'FORGOT_PASSWORD') {
            handleForgotPassword();
        }
    } catch (e) {
        // Errors handled in specific functions
    } finally {
        setIsLoading(false);
    }
  };

  const switchView = (newView: 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD') => {
    setView(newView);
    setError(null);
    setSuccessMsg(null);
    setFormData({ name: '', email: '', password: '' });
    setResetEmail('');
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Background/Left Split */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2564&auto=format&fit=crop" 
          alt="Studio Background" 
          className="w-full h-full object-cover animate-zoom-slow"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl inline-block self-start">
               <img 
                src="/logo.png" 
                alt="Stories by TJ" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
               <div className="hidden text-2xl font-serif italic font-bold tracking-wider text-black">
                <span className="text-brand-600">STORIES</span> <span className="text-black text-lg not-italic">by</span> <span className="text-brand-600">TJ</span>
              </div>
            </div>
            
            <div>
                <p className="text-brand-500 tracking-widest uppercase text-xs font-semibold mb-4">Client Portal</p>
                <h2 className="text-5xl font-serif text-white mb-6 leading-tight">
                    Where your <br/> <span className="italic text-zinc-400">memories</span> live.
                </h2>
                <p className="text-zinc-300 max-w-md font-light">
                    Access your private gallery, view proofs, and manage your bookings in one secure location.
                </p>
            </div>
        </div>
      </div>

      {/* Right Split / Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative bg-zinc-50 overflow-hidden">
        
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>

        {/* Large Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
             <span className="font-serif font-bold text-[200px] xl:text-[300px] text-zinc-900/[0.03] leading-none whitespace-nowrap">
                {view === 'LOGIN' ? 'STORIES' : view === 'SIGNUP' ? 'CREATE' : 'RESET'}
            </span>
        </div>

        {/* Back Button */}
        <button 
            onClick={onBack}
            className="absolute top-8 right-8 lg:top-12 lg:right-12 flex items-center text-zinc-400 hover:text-brand-600 transition-colors group z-20"
        >
            <span className="text-xs uppercase tracking-widest mr-2 group-hover:-translate-x-1 transition-transform font-medium">Return Home</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>

        <div className="w-full max-w-md animate-fade-in-up relative z-10">
            {/* Rounder Card Wrapper */}
            <div className="bg-white/90 backdrop-blur-2xl border border-zinc-200 p-10 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-3xl">
                
                <div className="mb-10 text-center">
                    <h2 className="text-brand-600 tracking-widest text-xs uppercase font-semibold mb-3">
                        Client Portal
                    </h2>
                    <h3 className="text-3xl font-serif text-black mb-4">
                        {view === 'LOGIN' ? 'Welcome Back' : view === 'SIGNUP' ? 'Join Stories by TJ' : 'Reset Password'}
                    </h3>
                    <div className="h-[1px] w-[40px] bg-[#C62828] mx-auto mb-6"></div>
                    
                    <p className="text-zinc-600 text-sm font-light leading-relaxed">
                        {view === 'LOGIN' ? 'Enter your credentials to access your personal gallery and bookings.' : 
                        view === 'SIGNUP' ? 'Create an account to begin your journey with us.' :
                        'Enter your registered email address to receive a password reset link.'}
                    </p>
                </div>

                {/* Error / Success Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 p-3 flex items-start space-x-3 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-900 leading-relaxed">{error}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 bg-green-50 border border-green-100 p-3 flex items-start space-x-3 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-900 leading-relaxed">{successMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {view === 'SIGNUP' && (
                        <div className="group">
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Full Name</label>
                            <input 
                                type="text"
                                required={view === 'SIGNUP'} 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white border border-zinc-300 text-black p-3.5 focus:border-black outline-none transition-all placeholder:text-zinc-400 rounded-xl font-light"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    {(view === 'LOGIN' || view === 'SIGNUP') && (
                        <>
                            <div className="group">
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white border border-zinc-300 text-black p-3.5 focus:border-black outline-none transition-all placeholder:text-zinc-400 rounded-xl font-light"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Password</label>
                                <input 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-white border border-zinc-300 text-black p-3.5 focus:border-black outline-none transition-all placeholder:text-zinc-400 rounded-xl font-light"
                                    placeholder="••••••••"
                                />
                            </div>
                        </>
                    )}

                    {view === 'FORGOT_PASSWORD' && (
                        <div className="group">
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5 font-bold">Registered Email</label>
                            <input 
                                type="email" 
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full bg-white border border-zinc-300 text-black p-3.5 focus:border-black outline-none transition-all placeholder:text-zinc-400 rounded-xl font-light"
                                placeholder="name@example.com"
                            />
                        </div>
                    )}

                    {view === 'LOGIN' && (
                        <div className="flex justify-end">
                            <button 
                                type="button"
                                onClick={() => switchView('FORGOT_PASSWORD')}
                                className="text-xs text-zinc-400 hover:text-brand-600 transition-colors font-medium hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 uppercase tracking-widest font-bold text-xs hover:bg-brand-600 transition-all flex items-center justify-center space-x-2 group disabled:opacity-70 disabled:cursor-not-allowed shadow-none hover:shadow-lg mt-6 rounded-xl"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>
                                    {view === 'LOGIN' ? 'Sign In' : 
                                    view === 'SIGNUP' ? 'Create Account' : 
                                    'Send Reset Link'}
                                </span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {view !== 'FORGOT_PASSWORD' && (
                    <>
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                                <span className="bg-white/80 backdrop-blur-sm px-2 text-zinc-400 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]">
                           {/* Google Button Injected Here via API */}
                        </div>
                    </>
                )}

                <div className="mt-8 text-center pt-4 border-t border-zinc-100">
                    {view === 'LOGIN' ? (
                        <p className="text-zinc-500 text-sm">
                            Don't have an account? 
                            <button 
                                onClick={() => switchView('SIGNUP')}
                                className="text-black hover:text-brand-600 font-bold transition-colors ml-1"
                            >
                                Sign Up
                            </button>
                        </p>
                    ) : view === 'SIGNUP' ? (
                        <p className="text-zinc-500 text-sm">
                            Already have an account? 
                            <button 
                                onClick={() => switchView('LOGIN')}
                                className="text-black hover:text-brand-600 font-bold transition-colors ml-1"
                            >
                                Log In
                            </button>
                        </p>
                    ) : (
                        <button 
                            onClick={() => switchView('LOGIN')}
                            className="text-zinc-400 hover:text-brand-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center mx-auto space-x-1 transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Back to Login</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;