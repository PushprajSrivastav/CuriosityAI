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
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleDeleteThread = (e, threadId) => {
    e.stopPropagation();
    const updatedThreads = threads.filter(t => t.id !== threadId);
    if (updatedThreads.length === 0) {
      const newId = Date.now().toString();
      const newThread = { id: newId, title: 'New Thread', messages: [] };
      setThreads([newThread]);
      setActiveThreadId(newId);
    } else {
      setThreads(updatedThreads);
      if (activeThreadId === threadId) {
        setActiveThreadId(updatedThreads[0].id);
      }
    }
  };

  const startEditing = (e, thread) => {
    e.stopPropagation();
    setEditingThreadId(thread.id);
    setEditTitle(thread.title);
  };

  const saveEditing = (e) => {
    if (e) e.stopPropagation();
    if (editingThreadId && editTitle.trim() !== '') {
      setThreads(prev => prev.map(t => t.id === editingThreadId ? { ...t, title: editTitle.trim() } : t));
    }
    setEditingThreadId(null);
  };

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
        <div class="relative group/code my-4 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800">
          <div class="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Code</span>
          </div>
          <pre class="p-4 overflow-x-auto text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed"><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      `;
    });
    
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-100 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-teal-600 dark:text-teal-400">$1</code>');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>');
    
    formatted = formatted.split('\n').map(line => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1 pl-1">${line.substring(2)}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 my-1 pl-1">${line.replace(/^\d+\.\s/, '')}</li>`;
      }
      return line ? `<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">${line}</p>` : '<div class="h-2"></div>';
    }).join('');

    return formatted;
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans min-h-screen flex overflow-hidden">
      
      {/* Sidebar (SideNavBar) */}
      <aside className={`fixed left-0 top-0 h-full w-72 flex flex-col p-4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0 shadow-xl md:shadow-none' : '-translate-x-full md:translate-x-0 md:flex hidden'}`}>
        {/* Brand Header */}
        <div className="mb-6 px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">psychology</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CuriosityAI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded transition-colors focus:outline-none"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-lg">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
            </button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
        
        {/* CTA */}
        <button 
          onClick={handleCreateThread}
          className="w-full py-2.5 px-4 mb-6 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 text-slate-700 dark:text-slate-300 shadow-sm"
        >
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm">edit_square</span>
          <span className="font-semibold text-sm">New Chat</span>
        </button>
        
        {/* Navigation & History */}
        <nav className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <div className="pt-2">
            <h3 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Recent Threads</h3>
            <div className="space-y-1">
              {threads.map(thread => (
                <div 
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer rounded-md transition-colors ${thread.id === activeThreadId ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {editingThreadId === thread.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={saveEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(e);
                        if (e.key === 'Escape') setEditingThreadId(null);
                      }}
                      className="flex-1 w-full bg-transparent border-b border-teal-600 dark:border-teal-500 outline-none text-slate-900 dark:text-white truncate"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="truncate flex-1" title={thread.title}>{thread.title}</div>
                  )}
                  
                  {editingThreadId !== thread.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                      <button onClick={(e) => startEditing(e, thread)} className="text-slate-400 hover:text-amber-500 flex items-center justify-center transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button onClick={(e) => handleDeleteThread(e, thread.id)} className="text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
        
        {/* Profile Section */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:bg-slate-900 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
               {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center" title="Logout">
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 ml-0 md:ml-72 flex flex-col items-center relative z-10 w-full bg-slate-50 dark:bg-slate-900">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden sticky top-0 left-0 w-full p-3 z-40 bg-white dark:bg-slate-800/80 backdrop-blur-md flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300 p-1">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-semibold text-slate-900 dark:text-white truncate flex-1 text-center">{activeThread.title}</span>
          <div className="w-6"></div> {/* Spacer to center title */}
        </div>

        <div className="w-full max-w-3xl px-4 md:px-0 flex-1 flex flex-col pb-36 pt-8 overflow-y-auto">
          
          {activeThread.messages.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/50 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-3xl text-teal-600 dark:text-teal-400">chat_bubble</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">How can I help you today?</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">Ask a question, start a brainstorming session, or use Pro Search for deep reasoning.</p>
              </div>
            </div>
          ) : (
            /* Chat History */
            <div className="space-y-8 py-6">
              {activeThread.messages.map(message => (
                <div key={message.id}>
                  {message.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-teal-600 dark:bg-teal-500 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-sm">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-sm mt-1">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3 min-w-0">
                        {message.sources && !message.error && (
                          <div className="flex flex-col gap-2 mb-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[14px]">travel_explore</span>
                              Sources Investigated
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                              {message.sources.map((src, idx) => (
                                <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="shrink-0 max-w-[200px] px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:border-teal-600 hover:shadow-sm cursor-pointer transition-all flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-500"></span>
                                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{src.title}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className={`prose prose-slate prose-p:leading-relaxed max-w-none text-slate-800 dark:text-slate-200 text-[15px] ${message.error ? 'text-red-600 p-4 bg-red-50 rounded-xl border border-red-200' : ''}`} dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Sending Animation */}
              {sending && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center mt-1"></div>
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Input Area */}
      <div className="fixed bottom-0 right-0 left-0 md:left-72 p-4 md:p-6 bg-gradient-to-t from-slate-50 dark:from-slate-900 via-slate-50 dark:via-slate-900 to-transparent pointer-events-none z-30">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 pl-4 flex items-center gap-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border border-slate-200 dark:border-slate-700 focus-within:border-teal-500 dark:border-teal-400 focus-within:ring-1 focus-within:ring-teal-500 dark:ring-teal-400 transition-all">
            <input 
              className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:text-slate-400 py-2.5 font-medium text-[15px]" 
              placeholder="Ask anything..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            
            <div className="flex items-center gap-2 pr-1 shrink-0">
              {/* Pro Search Toggle */}
              <button 
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all select-none ${copilot ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50 text-teal-700 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100'}`}
                onClick={() => setCopilot(!copilot)}
                title="Pro Search Mode"
              >
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Pro</span>
              </button>
              
              {/* Send Button */}
              <button 
                onClick={() => handleSendMessage()}
                disabled={!query.trim() || sending}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${query.trim() && !sending ? 'bg-teal-600 dark:bg-teal-500 text-white hover:bg-teal-700 dark:hover:bg-teal-600 shadow-sm cursor-pointer' : 'bg-slate-100 text-slate-400 dark:text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-100'}`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-3 font-medium hidden md:block">
            CuriosityAI can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
