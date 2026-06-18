import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '../api/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Verifying...', type: 'loading' });

        try {
            const data = await loginAPI({ email, password });
            if (data.success) {
                setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.message || 'Something went wrong', 
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
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">psychology</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Enterprise Intelligence,<br /> Simplified.
                    </h1>
                    <p className="text-teal-100 dark:text-teal-50 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                        Join the next generation of professionals accelerating their workflows with our advanced AI suite.
                    </p>
                    
                    {/* Minimal decorative element */}
                    <div className="hidden md:block mt-24 pt-8 border-t border-teal-500 dark:border-teal-400/30">
                        <div className="flex items-center gap-4 text-teal-200 dark:text-teal-100">
                            <span className="material-symbols-outlined">security</span>
                            <span className="text-sm font-medium">Enterprise-grade security standard</span>
                        </div>
                    </div>
                </div>
                
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 dark:bg-teal-900/200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-700 dark:bg-teal-800 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4"></div>
            </section>

            {/* Right Side: Authentication Form */}
            <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-white dark:bg-slate-800 relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-md px-8 py-12">
                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sign in to your CuriosityAI workstation.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
                            <input 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm" 
                                id="email" 
                                placeholder="name@company.com" 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:text-teal-300 transition-colors">Forgot Password?</Link>
                            </div>
                            <input 
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 px-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:ring-teal-400/20 focus:border-teal-500 dark:border-teal-400 transition-all shadow-sm" 
                                id="password" 
                                placeholder="••••••••" 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={message.type === 'loading'}
                            className="w-full bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white py-2.5 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-4"
                        >
                            {message.type === 'loading' ? 'Signing In...' : 'Sign In'}
                        </button>

                        {message.text && (
                            <div className={`mt-4 text-center text-sm font-medium py-3 px-4 rounded-lg border ${
                                message.type === 'error' ? 'text-red-700 bg-red-50 border-red-200' : 
                                message.type === 'success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50'
                            }`}>
                                {message.text}
                            </div>
                        )}
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Don't have an account? 
                        <Link to="/register" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline underline-offset-4 ml-1">Create Account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
