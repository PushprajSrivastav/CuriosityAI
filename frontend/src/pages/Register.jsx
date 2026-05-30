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
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Grid & Radial Glows */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/10 to-transparent opacity-60 filter blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-purple-500/5 to-transparent opacity-60 filter blur-3xl"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
            </div>

            {/* Glowing decorative blobs */}
            <div className="absolute top-1/4 -left-10 w-72 h-72 bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

            <div className="relative w-full max-w-md p-8 bg-[#0b0f19]/70 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl z-10">
                <div className="text-center mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10 mx-auto mb-4 text-lg">
                        C
                    </div>
                    
                    {!showOtpScreen ? (
                        <>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                                Join <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">CuriosityAI</span>
                            </h1>
                            <p className="text-slate-400 text-xs">Create an account to get started</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                                Verify <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Email</span>
                            </h1>
                            <p className="text-slate-400 text-xs">Enter the 6-digit OTP code sent to {registeredEmail}</p>
                        </>
                    )}
                </div>

                {!showOtpScreen ? (
                    // Registration Form
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 ml-1">Username</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm placeholder-slate-600"
                                placeholder="johndoe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 ml-1">Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm placeholder-slate-600"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 ml-1">Password</label>
                            <input 
                                type="password" 
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm placeholder-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={message.type === 'loading'}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-[0.98] border border-indigo-500/50 mt-4 text-sm disabled:opacity-50"
                        >
                            {message.type === 'loading' ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                ) : (
                    // OTP Verification Form
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300 ml-1">6-Digit Verification Code</label>
                            <input 
                                type="text" 
                                required 
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Numeric only
                                className="w-full px-4 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white text-center text-xl font-bold tracking-[8px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder-slate-600"
                                placeholder="000000"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={message.type === 'loading' || otpCode.length !== 6}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-[0.98] border border-indigo-500/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {message.type === 'loading' ? 'Verifying...' : 'Verify & Activate'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => {
                                setShowOtpScreen(false);
                                setMessage({ text: '', type: '' });
                            }}
                            className="w-full py-2 bg-transparent text-slate-400 hover:text-slate-300 font-semibold text-xs transition-colors"
                        >
                            Back to Registration
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-xs">
                        Already have an account? 
                        <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 ml-1 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>

                {message.text && (
                    <div className={`mt-6 text-center text-xs font-bold py-2.5 px-4 rounded-xl border ${
                        message.type === 'error' ? 'text-red-400 bg-red-500/5 border-red-500/10' : 
                        message.type === 'success' ? 'text-green-400 bg-green-500/5 border-green-500/10' : 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
