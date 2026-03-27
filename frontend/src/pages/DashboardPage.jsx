import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Bot, Plus, MessageSquare, Layers, Code, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const DashboardPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const isDemoMode = searchParams.get('demo') === 'true';

    const [user, setUser] = useState(null);
    const activeUser = isDemoMode ? null : user;
    // basic stat states
    const [streak, setStreak] = useState(0);
    const [lastLoginTime, setLastLoginTime] = useState(null);
    const [questionsLearned, setQuestionsLearned] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [authLoaded, setAuthLoaded] = useState(false);
    
    // calendar and graph state
    const [activeDates, setActiveDates] = useState([]);
    const [calendarBlanks, setCalendarBlanks] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, u => {
            setUser(u);
            setAuthLoaded(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const now = new Date();
            const todayStr = now.toLocaleDateString();
            
            // 1. Resolve Calendar Settings First
            const year = now.getFullYear();
            const month = now.getMonth();
            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0(Sun) - 6(Sat)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const blanks = Array(firstDayOfMonth).fill(null);
            const monthDays = Array.from({length: daysInMonth}, (_, i) => new Date(year, month, i + 1));
            setCalendarBlanks(blanks);
            setCalendarDays(monthDays);
            
            // Default flat graph data for guests / before load
            const initialGraphData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString();
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                initialGraphData.push({
                    dateKey: dateStr,
                    day: dayLabel,
                    questions: 0
                });
            }

            if (!activeUser) {
                setStreak(0);
                setActiveDates([]);
                setGraphData(initialGraphData);
                setQuestionsLearned(0);
                setIsLoading(false);
                return;
            }
            
            // 2. Fetch User Stats (Streak)
            const userRef = doc(db, 'users', activeUser.uid);
            const userSnap = await getDoc(userRef);
            
            let currentStreak = 1;
            let activeDatesArr = [todayStr];
            let lastLoginDate = todayStr;
            let savedDateTimeStr = now.toISOString();
            
            if (userSnap.exists()) {
                const data = userSnap.data();
                currentStreak = data.streakCount || 0;
                lastLoginDate = data.lastLoginDate;
                activeDatesArr = data.activeDates || [];
                savedDateTimeStr = data.lastLoginTime || now.toISOString();
                
                if (lastLoginDate !== todayStr) {
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    const yesterdayStr = yesterday.toLocaleDateString();
                    
                    if (lastLoginDate === yesterdayStr) {
                        currentStreak += 1;
                    } else {
                        currentStreak = 1;
                    }
                    
                    if (!activeDatesArr.includes(todayStr)) {
                        activeDatesArr.push(todayStr);
                    }
                    
                    savedDateTimeStr = now.toISOString();
                    await updateDoc(userRef, {
                        streakCount: currentStreak,
                        lastLoginDate: todayStr,
                        activeDates: activeDatesArr,
                        lastLoginTime: savedDateTimeStr
                    });
                }
            } else {
                await setDoc(userRef, {
                    streakCount: 1,
                    lastLoginDate: todayStr,
                    activeDates: [todayStr],
                    lastLoginTime: savedDateTimeStr
                });
            }
            
            setStreak(currentStreak);
            setActiveDates(activeDatesArr);
            
            // 3. Last Login Time formatting
            if (savedDateTimeStr) {
                const dateObj = new Date(savedDateTimeStr);
                setLastLoginTime(dateObj.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
            }
            
            // 4. Fetch Chat Questions Logic 
            const q = query(collection(db, 'chats'), where('userId', '==', activeUser.uid));
            const chatSnaps = await getDocs(q);
            
            const localGraphHistory = {}; 
            
            chatSnaps.forEach(chatDoc => {
                const chatData = chatDoc.data();
                const chatDateStr = chatData.updatedAt ? new Date(chatData.updatedAt.toMillis()).toLocaleDateString() : todayStr;
                
                if (chatData.messages) {
                    const userQs = chatData.messages.filter(m => m.role === 'user').length;
                    if (!localGraphHistory[chatDateStr]) {
                        localGraphHistory[chatDateStr] = 0;
                    }
                    localGraphHistory[chatDateStr] += userQs;
                }
            });
            
            // Compute total questions
            let totalQs = 0;
            for (let k in localGraphHistory) {
                totalQs += localGraphHistory[k];
            }
            setQuestionsLearned(totalQs);
            
            // Build Final Graph Data for logged-in user
            const finalGraphData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString();
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                finalGraphData.push({
                    dateKey: dateStr,
                    day: dayLabel,
                    questions: localGraphHistory[dateStr] || 0
                });
            }
            setGraphData(finalGraphData);
            setIsLoading(false);
        };
        
        fetchDashboardData();
    }, [activeUser]);

    // Custom Tooltip for Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-blue-400 font-bold">
                        {payload[0].value} Questions
                    </p>
                </div>
            );
        }
        return null;
    };

    // Dummy Data for UI Mockups
    const dummyQuestions = [
        { id: 1, text: "Explain the difference between React state and props.", date: "Today" },
        { id: 2, text: "What are the core principles of Object-Oriented Programming?", date: "Yesterday" },
        { id: 3, text: "How does the Python Global Interpreter Lock (GIL) work?", date: "Oct 21" }
    ];

    const dummyDecks = [
        { id: 1, title: "React Fundamentals", count: 24, icon: <Layers size={28} /> },
        { id: 2, title: "Python Basics", count: 45, icon: <Code size={28} /> },
        { id: 3, title: "System Design", count: 12, icon: <Database size={28} /> }
    ];

    return (
        <div className="flex flex-col h-screen w-full bg-[#020617] overflow-hidden font-sans text-slate-100">
            {/* Header */}
            <header className="p-4 px-8 flex items-center justify-between bg-transparent flex-shrink-0 border-b border-white/5 relative z-20">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-xl font-extrabold text-slate-50 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
                        Zentrix<span className="text-blue-500">AI</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(isDemoMode ? '/chat?demo=true' : '/chat')} 
                        className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-5 py-2 rounded-xl transition-all font-medium border border-blue-500/30 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                    >
                        <Bot size={18} />
                        Chatbot
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    
                    {!activeUser && authLoaded && (
                        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                            <div className="flex flex-col">
                                <span className="text-orange-400 font-semibold text-lg">{isDemoMode ? "Welcome to Demo Dashboard" : "Guest Mode"}</span>
                                <span className="text-slate-400 text-sm">{isDemoMode ? "You are interacting with a temporary sandbox dashboard that will not affect your logged-in account data." : "Dashboard values are default and activity is not recorded. Login to use the dashboard fully."}</span>
                            </div>
                            <button onClick={() => isDemoMode ? navigate('/') : navigate('/signin')} className="shrink-0 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/50 px-6 py-2 rounded-xl font-medium transition-all">
                                {isDemoMode ? "Exit Demo" : "Log In Now"}
                            </button>
                        </div>
                    )}

                    {activeUser && (
                        <div>
                            <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome back, {activeUser.displayName || activeUser.email?.split('@')[0]}!</h2>
                            <p className="text-slate-400 mt-2">Here is your personal learning progress dashboard.</p>
                        </div>
                    )}
                    
                    {/* Section 1: Top Container - Streak Graph & Calendar */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 tracking-tight">
                            <Flame className="text-orange-500" strokeWidth={2.5} />
                            Daily Streak
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Left Graph (2/3) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col justify-between shadow-2xl"
                            >
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-slate-300">Activity Overview</h3>
                                    <p className="text-sm text-slate-500 mt-1">Number of questions asked continuously over active days.</p>
                                </div>
                                <div className="h-64 w-full mt-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorQs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis 
                                                dataKey="day" 
                                                stroke="#64748b" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 12 }} 
                                                dy={10} 
                                            />
                                            {/* Disallow decimals to show sequence of integers */}
                                            <YAxis 
                                                stroke="#64748b" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="questions" 
                                                stroke="#3b82f6" 
                                                strokeWidth={3} 
                                                fillOpacity={1} 
                                                fill="url(#colorQs)" 
                                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }} 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Right Calendar Streak (1/3) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                                className="lg:col-span-1 bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/50 rounded-3xl p-6 lg:p-8 backdrop-blur-xl flex flex-col shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                    <Flame size={180} className="text-orange-500" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full items-center justify-between">
                                    
                                    {/* Big Count Badge */}
                                    <div className="flex flex-col items-center mb-6">
                                        <div className="p-4 bg-orange-500/10 rounded-full text-orange-400 mb-3 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                                            <Flame size={32} />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-extrabold text-white tracking-tight">{streak}</span>
                                            <span className="text-lg text-orange-200/60 font-medium">Day Streak</span>
                                        </div>
                                    </div>
                                    
                                    {/* Calendar View */}
                                    <div className="w-full max-w-[260px] bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                                        {/* Days Header */}
                                        <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                            {['S','M','T','W','T','F','S'].map((day, i) => (
                                                <div key={i} className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">{day}</div>
                                            ))}
                                        </div>
                                        {/* Days Grid */}
                                        <div className="grid grid-cols-7 gap-2">
                                            {calendarBlanks.map((_, i) => (
                                                <div key={`blank-${i}`} className="aspect-square"></div>
                                            ))}
                                            {calendarDays.map((d, i) => {
                                                const dayStr = d.toLocaleDateString();
                                                const isDateActive = activeDates.includes(dayStr);
                                                const isToday = dayStr === new Date().toLocaleDateString();
                                                
                                                return (
                                                    <div key={i} className={`aspect-square flex items-center justify-center rounded-lg transition-all ${isToday && !isDateActive ? 'border border-slate-600' : ''}`}>
                                                        {isDateActive ? (
                                                            <div className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.6)] animate-pulse">
                                                                <Flame size={20} fill="currentColor" strokeWidth={1} />
                                                            </div>
                                                        ) : (
                                                            <div className={`text-sm ${isToday ? 'text-white font-bold' : 'text-slate-600 font-medium'}`}>
                                                                {d.getDate()}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                            
                        </div>
                    </section>

                    {/* Section 2: Questions Learned */}
                    <section className="pt-8 mt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-3">
                                <span className="text-blue-500 font-bold opacity-70">#</span> Questions Learned
                                <span className="text-[10px] font-normal px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest ml-2">Saved from Chat</span>
                            </h2>
                            <p className="text-sm text-slate-500">{questionsLearned} total recorded</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {dummyQuestions.map((q) => (
                                <div key={q.id} className="bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-blue-500/30 rounded-2xl p-5 transition-all group flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-blue-500/10">
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="mt-1 flex-shrink-0 p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                            <MessageSquare size={18} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-blue-100 transition-colors">"{q.text}"</p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-4 mt-auto">
                                        <span>{q.date}</span>
                                        <span className="text-blue-500/0 group-hover:text-blue-400 transition-colors font-semibold flex items-center gap-1">Review Answer &rarr;</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Flashcards */}
                    <section className="pt-8 pb-12 mt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-3">
                                <span className="text-purple-500 font-bold opacity-70">#</span> Flashcards
                                <span className="text-[10px] font-normal px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest ml-2">Active Decks</span>
                            </h2>
                            <button className="text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl transition-colors border border-white/10 flex items-center gap-2">
                                <Plus size={16} /> New Deck
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {dummyDecks.map((deck) => (
                                <div key={deck.id} className="bg-gradient-to-br from-slate-900/40 to-slate-950 border border-purple-500/10 hover:border-purple-500/30 rounded-3xl p-6 transition-all group cursor-pointer shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col items-center justify-center text-center">
                                    <div className="p-5 bg-purple-500/10 text-purple-400 rounded-2xl mb-5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                                        {deck.icon}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-200 mb-1">{deck.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{deck.count} terms inside</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
