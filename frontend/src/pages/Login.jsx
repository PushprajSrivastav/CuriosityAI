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
        <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#030712] text-[#f8fafc] font-sans selection:bg-[#4f46e5] selection:text-white">
            {/* Left Side: Visual Area */}
            <section className="relative w-full md:w-1/2 min-h-[409px] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#030712]"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const glow = document.getElementById('mouse-glow');
                    if (glow) {
                        glow.style.left = `${e.clientX - rect.left - 200}px`;
                        glow.style.top = `${e.clientY - rect.top - 200}px`;
                    }
                }}
            >
                {/* Background Decorative Elements */}
                <div className="absolute inset-0 z-0">
                    <div id="mouse-glow" className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4f46e5]/20 rounded-full blur-[120px] animate-pulse transition-all duration-300 ease-out"></div>
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
                                Explore the <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-indigo-400">Unknown.</span>
                            </h1>
                            <p className="text-[#94a3b8] text-lg max-w-xs mx-auto leading-relaxed">
                                Unlock advanced intelligence with our most sophisticated neural framework yet.
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
                    <span className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Neural Link Active</span>
                </div>
            </section>

            {/* Right Side: Authentication Form */}
            <section className="w-full md:w-1/2 min-h-screen flex items-center justify-center bg-[#0f172a]/40 relative z-20 backdrop-blur-sm border-l border-white/5">
                <div className="w-full max-w-md px-8 py-12">
                    <div className="mb-10 text-left">
                        <h2 className="text-3xl font-bold text-[#f8fafc] mb-2 tracking-tight">Welcome back</h2>
                        <p className="text-[#94a3b8]">Sign in to your CuriosityAI workstation.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8]/80" htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="text-xs font-medium text-[#4f46e5] hover:text-[#4f46e5]/80 transition-colors">Forgot Password?</Link>
                            </div>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#4f46e5] transition-colors">lock</span>
                                <input 
                                    className="w-full bg-[#030712]/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#f8fafc] placeholder:text-[#94a3b8]/30 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40 focus:border-[#4f46e5] transition-all" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={message.type === 'loading'}
                            className="w-full bg-[#4f46e5] hover:bg-[#4f46e5]/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#4f46e5]/20 hover:shadow-[#4f46e5]/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {message.type === 'loading' ? 'Signing In...' : 'Sign In'}
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>

                        {message.text && (
                            <div className={`mt-4 text-center text-xs font-bold py-3 px-4 rounded-xl border ${
                                message.type === 'error' ? 'text-red-400 bg-red-500/5 border-red-500/10' : 
                                message.type === 'success' ? 'text-green-400 bg-green-500/5 border-green-500/10' : 'text-[#4f46e5] bg-[#4f46e5]/5 border-[#4f46e5]/10'
                            }`}>
                                {message.text}
                            </div>
                        )}
                    </form>

                    <p className="mt-12 text-center text-sm text-[#94a3b8]">
                        Don't have an account? 
                        <Link to="/register" className="text-[#4f46e5] font-semibold hover:underline decoration-[#4f46e5]/30 underline-offset-4 ml-1">Create Account</Link>
                    </p>
                </div>
            </section>
        </main>
    );
};

export default Login;
