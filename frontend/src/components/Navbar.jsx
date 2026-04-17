import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, u => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
                    <img src="/z.png" alt="Zentrix logo" className="h-9 w-9 rounded-md object-cover" />
                    <span className="text-xl font-bold text-white tracking-tight">Zentrix<span className="text-blue-500">AI</span></span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'About', 'Features', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/chat" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">AI Bot</Link>
                    <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                    
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

                {/* Mobile menu toggle */}
                <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#020617] border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl">
                    {['Home', 'About', 'Features', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => scrollToSection(item.toLowerCase())}
                            className="text-left text-sm font-medium text-slate-300 hover:text-white"
                        >
                            {item}
                        </button>
                    ))}
                    <div className="h-px bg-white/10 my-2"></div>
                    <Link to="/chat" className="text-sm font-medium text-slate-300">AI Bot</Link>
                    <Link to="/dashboard" className="text-sm font-medium text-slate-300">Dashboard</Link>
                    {!user ? (
                        <Link to="/signin" className="text-sm font-medium text-white">Login</Link>
                    ) : (
                        <button onClick={() => {
                            localStorage.removeItem('currentChatId');
                            signOut(auth);
                        }} className="text-left text-sm font-medium text-red-400">Logout</button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
