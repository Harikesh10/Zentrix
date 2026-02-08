import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [streak, setStreak] = useState(0);
    const [questionsLearned, setQuestionsLearned] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Streak Logic
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('last_visit_date');
        let currentStreak = parseInt(localStorage.getItem('streak_count') || '0');

        if (lastVisit !== today) {
            // If last visit was yesterday, increment. If older or null, reset/start at 1.
            // Note: accurate streak logic requires checking exact date difference. 
            // For this demo, we'll just check if there was a last visit. 
            // If it's the first time user opens dashboard today:
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastVisit === yesterday.toDateString()) {
                currentStreak += 1;
            } else {
                // Reset if broken streak or new user (but if new user, start at 1)
                currentStreak = 1;
            }

            localStorage.setItem('streak_count', currentStreak);
            localStorage.setItem('last_visit_date', today);
        } else if (currentStreak === 0) {
            currentStreak = 1;
            localStorage.setItem('streak_count', 1);
            localStorage.setItem('last_visit_date', today);
        }

        setStreak(currentStreak);

        // Fetch Questions Count
        const fetchStats = async () => {
            const sessionId = localStorage.getItem('last_session_id');
            if (sessionId) {
                try {
                    const response = await axios.get(`http://localhost:8000/stats/${sessionId}`);
                    setQuestionsLearned(response.data.question_count);
                } catch (error) {
                    console.error("Failed to fetch stats", error);
                }
            } else {
                console.log("No session ID found");
            }
            setIsLoading(false);
        };

        fetchStats();
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-[#020617] overflow-hidden font-sans text-slate-100">
            {/* Header */}
            <header className="p-4 px-8 flex items-center justify-between bg-transparent z-10 border-b border-white/5">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-xl font-extrabold text-slate-50 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
                        Zentrix<span className="text-blue-500">AI</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/chat')} className="text-sm text-slate-400 hover:text-white transition-colors">
                        Back to Chat
                    </button>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-white/10">
                        <Flame size={16} className="text-orange-500" />
                        <span className="text-sm font-bold">{streak} Day Streak</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Fire Streak Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gradient-to-br from-orange-500/10 to-red-600/5 border border-orange-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-orange-500/40 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Flame size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400">
                                    <Flame size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-orange-100">Daily Streak</h2>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-extrabold text-white tracking-tight">{streak}</span>
                                    <span className="text-lg text-orange-200/60 font-medium">days</span>
                                </div>
                                <p className="text-sm text-orange-200/50 mt-4 max-w-[80%]">
                                    You're on fire! Keep coming back daily to maintain your learning momentum.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Questions Learned Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-slate-900/50 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/40 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare size={120} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                                    <MessageSquare size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-blue-100">Questions Learned</h2>
                            </div>

                            <div className="mt-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-extrabold text-white tracking-tight">
                                        {isLoading ? '...' : questionsLearned}
                                    </span>
                                    <span className="text-lg text-blue-200/60 font-medium">questions</span>
                                </div>
                                <p className="text-sm text-blue-200/50 mt-4 max-w-[80%]">
                                    Total concepts explored and questions answered by your AI study pal.
                                </p>
                            </div>
                        </div>

                        {/* CTA maybe? */}
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={() => navigate('/chat')}
                                className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
