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
  const [focusMode, setFocusMode] = useState('All');
  const [copilot, setCopilot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [threadSearch, setThreadSearch] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  
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

  const handleDeleteThread = (id, e) => {
    e.stopPropagation();
    if (threads.length === 1) {
      // Keep at least one thread
      const newId = Date.now().toString();
      setThreads([{ id: newId, title: 'New Thread', messages: [] }]);
      setActiveThreadId(newId);
      return;
    }
    const filtered = threads.filter(t => t.id !== id);
    setThreads(filtered);
    if (activeThreadId === id) {
      setActiveThreadId(filtered[0].id);
    }
  };

  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSendMessage = async (customPrompt) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim() || sending) return;

    setSending(true);
    setQuery('');

    // Construct the user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message to active thread
    let updatedMessages = [...activeThread.messages, userMessage];
    
    // Auto-update thread title if it was "New Thread" or default
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
      // Add a slight delay if copilot mode is checked to simulate "deep research"
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
          { title: 'Gemini Generative Engine', url: 'https://deepmind.google/technologies/gemini/' },
          { title: 'Web Search Engine', url: 'https://google.com' },
          { title: 'CuriosityAI Index', url: 'https://google.com' }
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
        content: 'I encountered an error connecting to the AI models. Please ensure your backend server is running and the GEMINI_API_KEY is configured correctly.',
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
    
    // Format code blocks with a clean container
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      const escapedCode = code.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      return `
        <div class="relative group/code my-4">
          <div class="flex items-center justify-between px-4 py-1.5 bg-[#0b0f19] border border-white/5 rounded-t-xl text-xs text-slate-400 font-mono">
            <span>Code Block</span>
          </div>
          <pre class="bg-[#050811] border-x border-b border-white/5 rounded-b-xl p-4 overflow-x-auto text-sm font-mono text-indigo-200/90 leading-relaxed"><code>${code.trim()}</code></pre>
        </div>
      `;
    });
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-indigo-500/10 border border-indigo-500/15 rounded px-1.5 py-0.5 text-xs font-mono text-indigo-300">$1</code>');
    
    // Format bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    
    // Format lists and line breaks
    formatted = formatted.split('\n').map(line => {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return `<li class="ml-4 list-disc text-slate-300/95 my-1.5 pl-1">${line.substring(2)}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li class="ml-4 list-decimal text-slate-300/95 my-1.5 pl-1">${line.replace(/^\d+\.\s/, '')}</li>`;
      }
      return line ? `<p class="text-slate-300/90 leading-relaxed mb-3">${line}</p>` : '<div class="h-3"></div>';
    }).join('');

    return formatted;
  };

  // Filter threads for search
  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(threadSearch.toLowerCase())
  );

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
        
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="mt-6 text-slate-300 font-bold text-lg tracking-wide animate-pulse">Establishing Connection...</div>
          <div className="text-slate-500 text-xs mt-1.5">Checking backend server status</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 flex overflow-hidden font-sans">
      {/* Background radial overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-indigo-500/10 to-transparent opacity-60 filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-purple-500/5 to-transparent opacity-60 filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#060a13]/90 backdrop-blur-xl border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 hidden md:flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
              C
            </div>
            <span className="text-base font-bold text-white tracking-wider bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">CuriosityAI</span>
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400">v1.1</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Thread Action */}
        <div className="p-4 space-y-3">
          <button 
            onClick={handleCreateThread}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all border border-indigo-500/50 active:scale-[0.97]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Thread
          </button>

          {/* Search Threads input */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search threads..."
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500/40 focus:bg-white/[0.05] transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
            </svg>
          </div>
        </div>

        {/* Thread History list */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin">
          <div className="text-[10px] font-bold text-slate-500 px-3 py-1 uppercase tracking-widest mb-1">Library</div>
          {filteredThreads.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-xs">No threads found</div>
          ) : (
            filteredThreads.map(thread => (
              <div 
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${thread.id === activeThreadId ? 'bg-indigo-600/10 border-indigo-500/30 text-white font-medium' : 'border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 shrink-0 ${thread.id === activeThreadId ? 'text-indigo-400' : 'text-slate-500'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <span className="truncate text-sm pr-1">{thread.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteThread(thread.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-red-400 transition-all shrink-0"
                  title="Delete Thread"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/5 bg-[#040810]/70 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10 shrink-0 uppercase border border-white/10">
                {user?.username?.substring(0, 2) || 'US'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate capitalize tracking-wide">{user?.username || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              title="Logout"
              className="p-2 hover:bg-white/5 text-slate-500 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-[#030712]/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            )}
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest truncate max-w-xs md:max-w-md">
              {activeThread.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Thread Button */}
            <button 
              onClick={() => handleCopyMessage(window.location.href, 'share')}
              className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.302-3.03a2.25 2.25 0 11.485.848l-5.302 3.03m0 0l5.302 3.03a2.25 2.25 0 11-.485.847l-5.302-3.03" />
              </svg>
              {copiedMessageId === 'share' ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </header>

        {/* CHAT THREAD VIEW (Messages exist) */}
        {activeThread.messages.length > 0 ? (
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 pb-36 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-8">
              {activeThread.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-5 rounded-2xl border transition-all duration-300 ${message.role === 'user' ? 'bg-[#0f1423]/40 border-white/[0.04]' : 'bg-[#060a14]/20 border-transparent'}`}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/[0.03] pb-3">
                    <div className="flex items-center gap-3">
                      {message.role === 'user' ? (
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-[9px] text-indigo-400 uppercase shrink-0">
                          {user?.username?.substring(0, 2) || 'US'}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow shadow-indigo-500/25">
                          AI
                        </div>
                      )}
                      <span className="text-xs font-bold text-white capitalize">
                        {message.role === 'user' ? (user?.username || 'You') : 'Gemini Assistant'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{message.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className={`text-slate-300 leading-relaxed text-[15px] ${message.error ? 'text-red-400 bg-red-500/5 p-4 rounded-xl border border-red-500/10' : ''}`}>
                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div 
                        dangerouslySetInnerHTML={{ __html: formatAIResponse(message.content) }} 
                        className="prose prose-invert max-w-none text-slate-300/90"
                      />
                    )}
                  </div>

                  {/* Sources row (For assistant outputs) */}
                  {message.role === 'assistant' && message.sources && !message.error && (
                    <div className="mt-5 pt-4 border-t border-white/[0.03]">
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-indigo-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
                        </svg>
                        Sources Found
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((src, index) => (
                          <a 
                            key={index}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-white/[0.02] hover:bg-indigo-500/5 rounded-xl border border-white/5 hover:border-indigo-500/20 text-xs text-indigo-300 hover:text-indigo-200 transition-all font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            {src.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message actions footer */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.02]">
                    <button 
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className="p-1.5 hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold"
                      title="Copy content"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                      </svg>
                      {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Streaming loading animation */}
              {sending && (
                <div className="p-5 rounded-2xl bg-[#060a14]/10 border border-transparent space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/[0.02] pb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-[9px] text-white shrink-0 shadow shadow-indigo-500/25">
                      AI
                    </div>
                    <span className="text-xs font-bold text-white">Gemini Assistant</span>
                  </div>
                  
                  <div className="pl-2 space-y-2">
                    <div className="h-4 bg-white/5 rounded-md animate-pulse w-3/4"></div>
                    <div className="h-4 bg-white/5 rounded-md animate-pulse w-5/6"></div>
                    <div className="h-4 bg-white/5 rounded-md animate-pulse w-2/3"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          
          /* EMPTY STATE (Welcome Panel) */
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 pb-28">
            <div className="w-full max-w-2xl text-center space-y-10">
              
              {/* Hero title */}
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-4xl md:text-[52px] font-black tracking-tight text-white leading-none">
                  Where <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">knowledge</span> begins
                </h1>
                <p className="text-slate-400/90 text-sm md:text-base font-medium max-w-md mx-auto leading-relaxed">
                  Ask, discover, and search topics instantly powered by Gemini 3.5.
                </p>
              </div>

              {/* Large search card */}
              <div className="bg-[#0b0f19]/70 border border-white/10 rounded-2xl p-4 shadow-2xl focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300 backdrop-blur-xl relative">
                
                {/* Textarea */}
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  rows={3}
                  className="w-full bg-transparent outline-none resize-none text-white placeholder-slate-600 text-[15px] leading-relaxed pr-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                {/* Search controls */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                  <div className="flex items-center gap-3">
                    
                    {/* Focus Selector */}
                    <div className="relative">
                      <select 
                        value={focusMode} 
                        onChange={(e) => setFocusMode(e.target.value)}
                        className="bg-white/5 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-white/10 transition-all appearance-none pr-7"
                      >
                        <option value="All" className="bg-[#0b0f19]">🌐 Focus: All</option>
                        <option value="Academic" className="bg-[#0b0f19]">🎓 Focus: Academic</option>
                        <option value="Writing" className="bg-[#0b0f19]">✍️ Focus: Writing</option>
                        <option value="Code" className="bg-[#0b0f19]">💻 Focus: Code</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Copilot Toggle */}
                    <button 
                      onClick={() => setCopilot(!copilot)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${copilot ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow shadow-indigo-600/10' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h3m-3.07-19.491L10.5 8.5m0 0L13 12m-2.5-3.5L18 7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pro Search
                    </button>
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!query.trim() || sending}
                    className={`p-2.5 rounded-xl text-white transition-all ${query.trim() && !sending ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggestion prompt cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {[
                  { 
                    title: 'Explain Quantum Physics Simply', 
                    desc: 'Understanding subatomic particles without complex math.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h3m-3.07-19.491L10.5 8.5m0 0L13 12m-2.5-3.5L18 7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Create React Dashboard Code', 
                    desc: 'A gorgeous Tailwind React dashboard layout file.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-purple-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Plan 3-Day Trip to Kyoto', 
                    desc: 'Scenic temples, local food, and cultural travel plan.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-pink-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25g9 9 0 1118 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'SQL Database vs MongoDB', 
                    desc: 'Architectural comparison, data modeling and pros/cons.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-teal-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 10.125v3.75m16.5 0v3.75M3.75 13.875v3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                      </svg>
                    )
                  }
                ].map((card, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSendMessage(card.title)}
                    className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all duration-300 group flex items-start gap-3 active:scale-[0.98]"
                  >
                    <div className="p-2 bg-white/[0.03] group-hover:bg-indigo-500/10 rounded-xl transition-all shrink-0">
                      {card.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{card.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-normal">{card.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STICKY BOTTOM INPUT (Visible when active thread has messages) */}
        {activeThread.messages.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-[#030712] via-[#030712]/95 to-transparent shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="bg-[#0b0f19]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all flex items-end gap-3">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a follow up question..."
                  rows={1}
                  className="flex-1 bg-transparent outline-none resize-none text-white placeholder-slate-600 text-[14px] leading-relaxed py-1.5 pl-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <div className="flex items-center gap-2 shrink-0">
                  {/* Pro Search Toggle */}
                  <button 
                    onClick={() => setCopilot(!copilot)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all border ${copilot ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                    title="Toggle Pro Search"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096M9 21h3m-3.07-19.491L10.5 8.5m0 0L13 12m-2.5-3.5L18 7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Send Button */}
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!query.trim() || sending}
                    className={`p-2 rounded-xl text-white transition-all ${query.trim() && !sending ? 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95' : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
