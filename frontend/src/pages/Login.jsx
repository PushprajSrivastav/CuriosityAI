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
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                        Welcome <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Back</span>
                    </h1>
                    <p className="text-slate-400 text-xs">Enter your credentials to access CuriosityAI</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm placeholder-slate-600"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-slate-300">Password</label>
                            <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                        </div>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm placeholder-slate-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={message.type === 'loading'}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform active:scale-[0.98] border border-indigo-500/50 mt-2 text-sm disabled:opacity-50"
                    >
                        {message.type === 'loading' ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-xs">
                        Don't have an account? 
                        <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 ml-1 transition-colors">
                            Create Account
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

export default Login;
