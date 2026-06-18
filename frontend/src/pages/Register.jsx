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
        <main className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
            {/* Left Side: Visual Area */}
            <section className="relative w-full md:w-1/2 min-h-[300px] md:min-h-screen flex items-center justify-center overflow-hidden bg-teal-600 dark:bg-teal-500 text-white">
                <div className="relative z-10 w-full max-w-lg p-8 md:p-12 text-center md:text-left flex flex-col justify-center h-full">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-8 mx-auto md:mx-0 shadow-lg">
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">auto_awesome</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Join the next<br /> generation.
                    </h1>
                    <p className="text-teal-100 dark:text-teal-50 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                        Create an account to gain access to our sophisticated neural framework and elevate your productivity.
                    </p>
                    
                    {/* Minimal decorative element */}
                    <div className="hidden md:block mt-24 pt-8 border-t border-teal-500 dark:border-teal-400/30">
                        <div className="flex items-center gap-4 text-teal-200 dark:text-teal-100">
                            <span className="material-symbols-outlined">verified_user</span>
                            <span className="text-sm font-medium">SOC2 Type II Certified</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative background shapes */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/200 rounded-full blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/3"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-700 dark:bg-teal-800 rounded-full blur-3xl opacity-50 translate-y-1/3 translate-x-1/4"></div>
            </section>

            {/* Right Side: Authentication Form */}
            <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-white dark:bg-slate-800 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-md px-8 py-12">
                    <div className="mb-10 text-left">
                        {!showOtpScreen ? (
                            <>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
                                <p className="text-slate-500 dark:text-slate-400">Join CuriosityAI and start exploring.</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Verify Email</h2>
                                <p className="text-slate-500 dark:text-slate-400">Enter the 6-digit OTP code sent to {registeredEmail}</p>
                            </>
                        )}
                    </div>
                    
                    {!showOtpScreen ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="username">Username</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm" 
                                    id="username" 
                                    placeholder="johndoe" 
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm" 
                                    id="email" 
                                    placeholder="name@company.com" 
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={message.type === 'loading'}
                                className="w-full bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                            >
                                {message.type === 'loading' ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="otpCode">6-Digit Code</label>
                                <input 
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-4 text-center text-2xl tracking-[10px] text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm font-mono" 
                                    id="otpCode" 
                                    placeholder="000000" 
                                    type="text"
                                    maxLength={6}
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={message.type === 'loading' || otpCode.length !== 6}
                                className="w-full bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                            >
                                {message.type === 'loading' ? 'Verifying...' : 'Verify Email'}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowOtpScreen(false);
                                    setMessage({ text: '', type: '' });
                                }}
                                className="w-full py-2 bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors mt-2"
                            >
                                Back to Registration
                            </button>
                        </form>
                    )}

                    {message.text && (
                        <div className={`mt-4 text-center text-sm font-medium py-3 px-4 rounded-lg border ${
                            message.type === 'error' ? 'text-red-700 bg-red-50 border-red-200' : 
                            message.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Already have an account? 
                        <Link to="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline underline-offset-4 ml-1">Sign In</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Register;
