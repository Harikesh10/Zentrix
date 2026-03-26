import React, { useState, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, MessageSquare, Menu, X } from 'lucide-react';

const ChatPage = () => {
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(() => localStorage.getItem('currentChatId') || null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "chats"),
            where("userId", "==", user.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatsData = [];
            snapshot.forEach((doc) => {
                chatsData.push({ id: doc.id, ...doc.data() });
            });
            // Sort client-side to avoid needing a composite index in Firestore
            chatsData.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis() || 0;
                const timeB = b.updatedAt?.toMillis() || 0;
                return timeB - timeA;
            });
            setChats(chatsData);
        }, (error) => {
            console.error("Error fetching chats:", error);
        });
        return () => unsubscribe();
    }, [user]);

    // Persist active chat on refresh
    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem('currentChatId', currentChatId);
        } else {
            localStorage.removeItem('currentChatId');
        }
    }, [currentChatId]);

    const handleNewChat = () => {
        setCurrentChatId(null);
        if (window.innerWidth < 768) {
             setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#020617] overflow-hidden">
            {/* Sidebar */}
            <div className={`fixed md:relative z-20 flex-shrink-0 bg-[#060b1e] border-r border-[#1e293b] transition-all duration-300 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0 md:translate-x-0'} overflow-hidden h-full flex flex-col`}> 
                <div className="p-4 flex flex-col h-full w-64 min-w-[16rem]">
                    {/* Optional close button for mobile */}
                    <div className="flex justify-between items-center mb-4 md:hidden">
                        <h2 className="text-white font-bold ml-1">Chats</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    <button onClick={handleNewChat} className="flex items-center gap-2 w-full p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg active:scale-95">
                        <Plus size={18} />
                        <span className="font-semibold text-sm">New chat</span>
                    </button>
                    
                    <div className="mt-6 flex-1 overflow-y-auto">
                        <h3 className="text-xs font-bold text-slate-500 mb-3 px-2 uppercase tracking-wider">Your chats</h3>
                        <div className="space-y-1">
                            {chats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => {
                                        setCurrentChatId(chat.id);
                                        if (window.innerWidth < 768) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group ${currentChatId === chat.id ? 'bg-[#1e293b] text-white shadow-sm' : 'text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-200'}`}
                                >
                                    <MessageSquare size={16} className={`shrink-0 ${currentChatId === chat.id ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                    <span className="text-sm truncate font-medium">{chat.title || 'New Chat'}</span>
                                </button>
                            ))}
                            {chats.length === 0 && (
                                <div className="text-slate-500 text-sm text-center italic mt-4 px-2">
                                    No past chats yet. Start a new one!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative">
                <header className="p-4 flex items-center gap-4 bg-transparent z-10 sticky top-0 border-b border-transparent">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white md:hidden p-2 bg-[#1e293b] rounded-lg">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex items-center text-slate-400 hover:text-white p-2 rounded-lg hover:bg-[#1e293b] transition-all">
                        <Menu size={20} />
                    </button>
                    
                    <h1 className="text-xl font-extrabold text-slate-50 tracking-tighter cursor-pointer ml-2 md:ml-0" onClick={() => window.location.href = '/'}>
                        Zentrix<span className="text-blue-500">AI</span>
                    </h1>
                </header>

                <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
                    <ChatWindow
                        user={user}
                        sessionId={currentChatId}
                        onSessionChange={setCurrentChatId}
                    />
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
