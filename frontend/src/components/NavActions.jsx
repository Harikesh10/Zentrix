import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const NavActions = () => {
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, u => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="hidden md:flex items-center gap-4">
            <Link 
                to="/chat" 
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/chat' ? 'border border-white/20 text-white' : 'text-slate-300 hover:text-white'}`}
            >
                AI Bot
            </Link>
            <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${location.pathname === '/dashboard' ? 'border border-white/20 text-white' : 'text-slate-300 hover:text-white'}`}
            >
                Dashboard
            </Link>
            
            {!user ? (
                <Link to="/signin" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded-full transition-all shadow-lg hover:scale-105 ml-4">
                    Login
                </Link>
            ) : (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center shrink-0">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span className="text-white text-xs font-bold">{((user.displayName || user.email) || 'U').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="text-sm font-semibold text-white tracking-wide">{user.displayName || user.email?.split('@')[0]}</span>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('currentChatId');
                        signOut(auth);
                    }} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold py-1.5 px-4 rounded-full transition-all">
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default NavActions;


