import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI, verifyEmailAPI } from '../api/auth';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [otpCode, setOtpCode] = useState('');
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Creating account...', type: 'loading' });

        try {
            const data = await registerAPI(formData);
            if (data.success) {
                setMessage({ text: 'Account created! Verification code sent to your email.', type: 'success' });
                setRegisteredEmail(formData.email);
                setShowOtpScreen(true);
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Something went wrong', 
                type: 'error' 
            });
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Verifying code...', type: 'loading' });

        try {
            const data = await verifyEmailAPI(registeredEmail, otpCode);
            if (data.success) {
                setMessage({ text: 'Email verified successfully! Logging you in...', type: 'success' });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Invalid or expired code', 
                type: 'error' 
            });
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#030712] text-[#f8fafc] font-sans selection:bg-[#4f46e5] selection:text-white">
            {/* Left Side: Visual Area */}
            <section className="relative w-full md:w-1/2 min-h-[409px] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const glow = document.getElementById('mouse-glow-reg');
                    if (glow) {
                        glow.style.left = `${e.clientX - rect.left - 200}px`;
                        glow.style.top = `${e.clientY - rect.top - 200}px`;
                    }
                }}
            >
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 z-0">
                    <div id="mouse-glow-reg" className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-[120px] animate-pulse transition-all duration-300 ease-out"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
                </div>
                
                {/* Glassmorphism Geometry */}
                <div className="relative z-10 w-full max-w-lg p-8">
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-12 aspect-square flex flex-col justify-center items-center text-center animate-[float_8s_ease-in-out_infinite] relative">
                        {/* Internal Glowing Orb */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            <span className="material-symbols-outlined text-[#4f46e5] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
                                Join the <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-indigo-400">Revolution.</span>
                            </h1>
                            <p className="text-[#94a3b8] text-lg max-w-xs mx-auto leading-relaxed">
                                Get access to the most sophisticated neural framework yet.
                            </p>
                        </div>
                        {/* Visual Accent Image/Layer */}
                        <div className="mt-12 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                            <img alt="Futuristic Abstract" className="w-full h-48 object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB2k9dR_2lVh55OW47WdPHruQiknV87yZrdPTqZ-h13Wqe27O8q9mXdnXXRHXMo7-zSY2H5dlQHpO1kzs5JKf1eUF_ZuzJWMzuQWqAAOdSo2r7eSmtcs-IzoZAcvp9T7NzaeRgf9jh9vG3glC6-Xb2LjsD9i_P-wH9k2KAqFv9IfjCnoG891urRQSa-c6prggRp4nQWKWXVR7UmcBIn9mKmMJNC0POJ38yQFGoDP0RCcIwD-qwtsfbASeD0f2pn3tf151GH7C5drdV"/>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Floating Tag */}
                <div className="absolute bottom-12 left-12 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                    <div className="w-2 h-2 rounded-full bg-[#4f46e5] animate-ping"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">System Online</span>
                </div>
            </section>

            {/* Right Side: Authentication Form */}
            <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-[#0f172a]/40 relative z-20 backdrop-blur-sm border-l border-white/5">
                <div className="w-full max-w-md px-8 py-12">
                    <div className="mb-10 text-left">
                        {!showOtpScreen ? (
                            <>
                                <h2 className="text-3xl font-bold text-[#f8fafc] mb-2 tracking-tight">Create Account</h2>
                                <p className="text-[#94a3b8]">Join CuriosityAI and start exploring.</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-[#f8fafc] mb-2 tracking-tight">Verify Email</h2>
                                <p className="text-[#94a3b8]">Enter the 6-digit OTP code sent to {registeredEmail}</p>
                            </>
                        )}
                    </div>
                    
                    {!showOtpScreen ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]/80 ml-1" htmlFor="username">Username</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#4f46e5] transition-colors">person</span>
                                    <input 
                                        className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#f8fafc] placeholder:text-[#94a3b8]/30 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition-all" 
                                        id="username" 
                                        placeholder="johndoe" 
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]/80 ml-1" htmlFor="email">Email Address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#4f46e5] transition-colors">alternate_email</span>
                                    <input 
                                        className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#f8fafc] placeholder:text-[#94a3b8]/30 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition-all" 
                                        id="email" 
                                        placeholder="name@company.com" 
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]/80 ml-1" htmlFor="password">Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#4f46e5] transition-colors">lock</span>
                                    <input 
                                        className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#f8fafc] placeholder:text-[#94a3b8]/30 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition-all" 
                                        id="password" 
                                        placeholder="••••••••" 
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={message.type === 'loading'}
                                className="w-full bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#4f46e5]/20 hover:shadow-[#4f46e5]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {message.type === 'loading' ? 'Creating...' : 'Create Account'}
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]/80 ml-1" htmlFor="otpCode">6-Digit Code</label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-4 text-center text-2xl tracking-[10px] text-[#f8fafc] placeholder:text-[#94a3b8]/30 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition-all" 
                                        id="otpCode" 
                                        placeholder="000000" 
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={message.type === 'loading' || otpCode.length !== 6}
                                className="w-full bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#4f46e5]/20 hover:shadow-[#4f46e5]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {message.type === 'loading' ? 'Verifying...' : 'Verify Email'}
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">check_circle</span>
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowOtpScreen(false);
                                    setMessage({ text: '', type: '' });
                                }}
                                className="w-full py-2 bg-transparent text-[#94a3b8] hover:text-[#f8fafc] font-semibold text-xs transition-colors"
                            >
                                Back to Registration
                            </button>
                        </form>
                    )}

                    {message.text && (
                        <div className={`mt-6 text-center text-xs font-bold py-3 px-4 rounded-xl border ${
                            message.type === 'error' ? 'text-red-400 bg-red-500/5 border-red-500/10' : 
                            message.type === 'success' ? 'text-green-400 bg-green-500/5 border-green-500/10' : 'text-[#4f46e5] bg-[#4f46e5]/5 border-[#4f46e5]/10'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <p className="mt-12 text-center text-sm text-[#94a3b8]">
                        Already have an account? 
                        <Link to="/login" className="text-[#4f46e5] font-semibold hover:underline decoration-[#4f46e5]/30 underline-offset-4 ml-1">Sign In</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Register;
