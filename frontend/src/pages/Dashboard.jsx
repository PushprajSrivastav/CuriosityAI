import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMeAPI, logoutAPI } from '../api/auth';
import { askChatAPI } from '../api/chat';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Threads state (persisted in localStorage)
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem('curiosityai_threads');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Welcome to CuriosityAI', messages: [] }
    ];
  });
  
  const [activeThreadId, setActiveThreadId] = useState(() => {
    const savedId = localStorage.getItem('curiosityai_active_thread_id');
    return savedId || '1';
  });

  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [threads, activeThreadId, sending]);

  // Authenticate user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMeAPI();
        if (data.success) {
          setUser(data.user);
        } else {
          navigate('/login');
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [navigate]);

  // Persist threads to localStorage
  useEffect(() => {
    localStorage.setItem('curiosityai_threads', JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    localStorage.setItem('curiosityai_active_thread_id', activeThreadId);
  }, [activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleLogout = async () => {
    try {
      await logoutAPI();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCreateThread = () => {
    const newId = Date.now().toString();
    const newThread = {
      id: newId,
      title: 'New Thread',
      messages: []
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  const handleSendMessage = async (customPrompt) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim() || sending) return;

    setSending(true);
    setQuery('');

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let updatedMessages = [...activeThread.messages, userMessage];
    
    let newTitle = activeThread.title;
    if (activeThread.title === 'New Thread' || activeThread.title === 'Welcome to CuriosityAI') {
      newTitle = promptToSend.length > 30 ? promptToSend.substring(0, 27) + '...' : promptToSend;
    }

    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          title: newTitle,
          messages: updatedMessages
        };
      }
      return t;
    }));

    try {
      if (copilot) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const chatResponse = await askChatAPI(
        copilot 
          ? `[Deep Research Mode Activated] ${promptToSend}` 
          : promptToSend
      );
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: chatResponse.response,
        sources: [
          { title: 'Gemini Knowledge Base', url: 'https://deepmind.google/technologies/gemini/' },
          { title: 'CuriosityAI Index', url: '#' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...updatedMessages, assistantMessage]
          };
        }
        return t;
      }));
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an error connecting to the AI models. Please ensure your backend server is running.',
        error: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: [...updatedMessages, errorMessage]
          };
        }
        return t;
      }));
    } finally {
      setSending(false);
    }
  };

  const formatAIResponse = (text) => {
    if (!text) return '';
    let formatted = text;
    
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `
        <div class="relative group/code my-4 border border-white/10 rounded-xl overflow-hidden shadow-lg bg-[#0a0a0a]">
          <div class="flex items-center justify-between px-4 py-2 bg-white/5 text-xs text-slate-400 font-mono">
            <span>Code Block</span>
          </div>
          <pre class="p-4 overflow-x-auto text-sm font-mono text-indigo-200/90 leading-relaxed"><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      `;
    });
    
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-indigo-500/20 border border-indigo-500/30 rounded px-1.5 py-0.5 text-xs font-mono text-indigo-300">$1</code>');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    
    formatted = formatted.split('\n').map(line => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li class="ml-4 list-disc text-[#f8fafc] my-1.5 pl-1">${line.substring(2)}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li class="ml-4 list-decimal text-[#f8fafc] my-1.5 pl-1">${line.replace(/^\d+\.\s/, '')}</li>`;
      }
      return line ? `<p class="text-[#f8fafc]/90 leading-relaxed mb-3">${line}</p>` : '<div class="h-2"></div>';
    }).join('');

    return formatted;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#4f46e5]/20 border-t-[#4f46e5] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#030712] text-[#f8fafc] font-sans selection:bg-[#4f46e5]/30 min-h-screen flex overflow-hidden">
      
      {/* Sidebar (SideNavBar) */}
      <aside className={`fixed left-0 top-0 h-full w-72 flex flex-col p-6 bg-[#0f172a]/60 backdrop-blur-xl border-r border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:flex hidden'}`}>
        {/* Brand Header */}
        <div className="mb-8 px-2 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#f8fafc]">CuriosityAI</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#4f46e5] font-bold opacity-80">Intelligence Engine</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-white/50 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* CTA */}
        <button 
          onClick={handleCreateThread}
          className="w-full py-3 px-4 mb-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <span className="material-symbols-outlined text-[#4f46e5] group-hover:rotate-90 transition-transform">add</span>
          <span className="font-medium text-sm">New Chat</span>
        </button>
        
        {/* Navigation & History */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          <div className="mt-4 pt-4 border-t border-white/5">
            <h3 className="px-3 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-4">Recent Threads</h3>
            <div className="space-y-1">
              {threads.map(thread => (
                <div 
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`px-3 py-2 text-sm cursor-pointer truncate rounded-lg transition-colors ${thread.id === activeThreadId ? 'bg-[#4f46e5]/10 text-[#4f46e5] border-r-2 border-[#4f46e5] font-medium' : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/5'}`}
                >
                  {thread.title}
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        {/* Profile Section */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full border border-white/10 bg-[#4f46e5]/20 flex items-center justify-center text-[#4f46e5] font-bold uppercase">
               {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-[#94a3b8] truncate">{user?.email}</p>
            </div>
            <span onClick={handleLogout} className="material-symbols-outlined text-[#94a3b8] hover:text-red-400 transition-colors" title="Logout">logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-0 md:ml-72 pt-20 pb-32 min-h-screen flex flex-col items-center relative z-10 w-full transition-all">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden fixed top-0 left-0 w-full p-4 z-40 bg-[#030712]/80 backdrop-blur-md flex items-center gap-3 border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="text-white p-1">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-bold">{activeThread.title}</span>
        </div>

        <div className="w-full max-w-4xl px-4 md:px-8 flex-1 flex flex-col">
          
          {activeThread.messages.length === 0 ? (
            /* Welcome View (Empty State) */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 hover:opacity-100 transition-opacity duration-700">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#4f46e5] to-indigo-400 flex items-center justify-center animate-[float_4s_ease-in-out_infinite] shadow-[0_0_20px_rgba(79,70,229,0.2)]">
                <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">How can I help you explore?</h2>
                <p className="text-[#94a3b8] max-w-md mx-auto">Access the world's knowledge with CuriosityAI. Use Pro Search for deep reasoning and live data synthesis.</p>
              </div>
            </div>
          ) : (
            /* Chat History */
            <div className="space-y-10 py-10">
              {activeThread.messages.map(message => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tr-sm text-[#f8fafc] shadow-sm">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {message.sources && !message.error && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm">travel_explore</span>
                            Sources Found
                          </div>
                          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                            {message.sources.map((src, idx) => (
                              <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="min-w-[200px] p-3 rounded-xl bg-white/[0.03] backdrop-blur border border-white/5 hover:border-[#4f46e5]/40 cursor-pointer transition-all flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded-sm bg-[#4f46e5]/20 flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
                                  </div>
                                  <span className="text-[10px] font-bold opacity-60 truncate">{src.title}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="max-w-[95%] text-[#f8fafc] space-y-4">
                        <div className={message.error ? "text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20" : ""} dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Sending Animation */}
              {sending && (
                <div className="flex flex-col gap-6">
                  <div className="max-w-[95%] text-[#f8fafc] space-y-4 animate-pulse">
                     <div className="h-4 bg-white/10 rounded w-3/4"></div>
                     <div className="h-4 bg-white/10 rounded w-5/6"></div>
                     <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Input Area */}
      <div className="fixed bottom-0 right-0 left-0 md:left-72 p-4 md:p-8 bg-gradient-to-t from-[#030712] via-[#030712] to-transparent pointer-events-none z-30">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <div className="relative group">
            {/* Inner Container */}
            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl p-2 pl-6 flex items-center gap-4 shadow-[0_0_20px_rgba(79,70,229,0.1)] transition-all focus-within:ring-2 ring-[#4f46e5]/40 focus-within:border-[#4f46e5]/50 border border-white/10">
              <input 
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-[#f8fafc] placeholder:text-[#94a3b8]/50 py-3 font-medium" 
                placeholder="Ask anything... Shift + Return for new line" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              {/* Tools / Toggles */}
              <div className="flex items-center gap-3 pr-2 shrink-0">
                {/* Pro Search Toggle */}
                <div 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:bg-white/10 transition-all cursor-pointer select-none group/toggle ${copilot ? 'bg-[#4f46e5]/10 border-[#4f46e5]/40' : 'bg-white/5 border-white/5'}`}
                  onClick={() => setCopilot(!copilot)}
                >
                  <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${copilot ? 'text-[#4f46e5]' : 'text-[#94a3b8] group-hover/toggle:text-[#f8fafc]'}`}>Pro Search</span>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${copilot ? 'bg-[#4f46e5]' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-md ${copilot ? 'left-[18px]' : 'left-0.5'}`}></div>
                  </div>
                </div>
                
                {/* Send Button */}
                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!query.trim() || sending}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90 ${query.trim() && !sending ? 'bg-[#4f46e5] text-white hover:bg-indigo-400 shadow-[#4f46e5]/20 cursor-pointer' : 'bg-white/5 text-[#94a3b8] cursor-not-allowed border border-white/5'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
            </div>
            
            {/* Bottom Decorative Glow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-[#4f46e5] blur-2xl opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
          </div>
          <p className="text-center text-[10px] text-[#94a3b8] mt-4 font-medium opacity-50 hidden md:block">
            CuriosityAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
