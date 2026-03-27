import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Bot, FileText, LayoutDashboard, Brain, ArrowRight, CheckCircle, Send } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
            <Navbar />

            {/* HOME / HERO */}
            <section id="home" className="min-h-screen flex flex-col justify-center relative pt-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="z-10"
                    >
                        <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
                            Your Personal <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">AI Study Assistant</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                            An AI-powered platform that helps students learn smarter, revise faster, and track progress with personalized chat assistance.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                            <Link to="/chat?demo=true" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-2">
                                Start Studying <ArrowRight size={18} />
                            </Link>
                            <Link to="/dashboard?demo=true" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold py-3 px-8 rounded-full transition-all hover:border-white/20">
                                View Dashboard
                            </Link>
                        </motion.div>

                        {/* Marquee Quote */}
                        <motion.div variants={fadeInUp} className="mt-12 w-full overflow-hidden relative opacity-70">
                            <motion.div
                                animate={{ x: ["100%", "-100%"] }}
                                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                                className="whitespace-nowrap text-slate-500 font-mono text-sm tracking-wide italic"
                            >
                                “Bro really said ‘trust the process’ and then disappeared.”
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Abstract UI Mockup */}
                        <div className="relative z-10 bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Bot size={16} /></div>
                                    <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none text-sm text-slate-300 max-w-[80%]">Here's a breakdown of the quantum mechanics concept you asked about...</div>
                                </div>
                                <div className="flex items-start gap-3 flex-row-reverse">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs">You</div>
                                    <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none text-sm text-white max-w-[80%]">Can you explain the uncertainty principle again?</div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Bot size={16} /></div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-75"></div>
                                        <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative gradients */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] -z-10"></div>
                        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>
                    </motion.div>
                </div>
            </section>

            {/* ABOUT */}
            <section id="about" className="min-h-screen flex flex-col justify-center py-24 px-6 bg-slate-900/30">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6">Revolutionize Your Learning Experience</motion.h2>
                        <motion.div variants={fadeInUp} className="w-20 h-1 bg-blue-500 rounded-full mb-8"></motion.div>
                        <motion.p variants={fadeInUp} className="text-slate-400 text-lg leading-relaxed mb-6">
                            Zentrix isn't just another chatbot. It's a comprehensive learning ecosystem designed to understand your study materials and adapt to your unique learning style.
                        </motion.p>
                        <ul className="space-y-4">
                            {[
                                "Personalized learning paths adapted to your pace",
                                "Instant answers from your uploaded PDF documents",
                                "Smart progress tracking to identify weak spots",
                            ].map((item, i) => (
                                <motion.li
                                    variants={fadeInUp}
                                    whileHover={{ x: 10, color: "#fff" }}
                                    key={i}
                                    className="flex items-center gap-3 text-slate-300 transition-colors cursor-default"
                                >
                                    <CheckCircle className="text-blue-500" size={20} />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        className="relative"
                    >
                        <div className="grid grid-cols-2 gap-8 h-full min-h-[400px]">
                            {/* Card 1 - Top Left */}
                            <motion.div
                                initial={{ opacity: 0, x: -100, y: -100 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(168, 85, 247, 0.4)" }}
                                className="bg-slate-800 p-8 rounded-3xl border border-white/5 self-start shadow-xl z-10"
                            >
                                <Brain className="text-purple-400 mb-6" size={48} />
                                <h3 className="font-bold text-2xl mb-3">Cognitive AI</h3>
                                <p className="text-base text-slate-400 leading-relaxed">Advanced models that understand context, not just keywords.</p>
                            </motion.div>

                            {/* Card 2 - Bottom Right */}
                            <motion.div
                                initial={{ opacity: 0, x: 100, y: 100 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)" }}
                                className="bg-slate-800 p-8 rounded-3xl border border-white/5 self-end shadow-xl z-10"
                            >
                                <LayoutDashboard className="text-blue-400 mb-6" size={48} />
                                <h3 className="font-bold text-2xl mb-3">Visual Stats</h3>
                                <p className="text-base text-slate-400 leading-relaxed">Clean dashboards to visualize your daily progress.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="min-h-screen flex flex-col justify-center py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to master your subjects in one place.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: <Bot />, title: "AI Chat Tutor", desc: "24/7 assistance for any question, big or small." },
                            { icon: <FileText />, title: "PDF Analysis", desc: "Upload textbooks and chat directly with their content." },
                            { icon: <Brain />, title: "Smart Logic", desc: "Get topic recommendations based on your chat history." },
                            { icon: <LayoutDashboard />, title: "Progress Tracker", desc: "Monitor your learning streak and achievements." },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-slate-900/50 p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section id="contact" className="min-h-screen px-6 bg-slate-900/30 flex justify-center items-center">
                <div className="w-full max-w-sm bg-[#020617] p-6 rounded-2xl border border-white/10 shadow-xl">
                    <div className="text-center mb-5">
                        <h2 className="text-xl md:text-2xl font-bold mb-1">Get in Touch</h2>
                        <p className="text-slate-400 text-xs">Have feedback? We'd love to hear from you.</p>
                    </div>
                    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Email</label>
                            <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Message</label>
                            <textarea rows={3} className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="Your message here..."></textarea>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 text-sm">
                            Send Message <Send size={14} />
                        </button>
                    </form>
                </div>
            </section>



            {/* FOOTER */}
            <footer className="py-6 px-6 border-t border-white/5 bg-[#020617] text-xs">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-6">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/z.png" alt="Zentrix logo" className="h-7 w-7 rounded-md object-cover" />
                            <h3 className="text-lg font-bold">Zentrix<span className="text-blue-500">AI</span></h3>
                        </div>
                        <p className="text-slate-500 leading-relaxed">The ultimate AI study companion for students.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-slate-300">Product</h4>
                        <ul className="space-y-1.5 text-slate-500">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Features</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Pricing</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Integrations</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-slate-300">Company</h4>
                        <ul className="space-y-1.5 text-slate-500">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-3 text-slate-300">Legal</h4>
                        <ul className="space-y-1.5 text-slate-500">
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                            <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-4 border-t border-white/5 text-center text-[10px] text-slate-600">
                    © 2026 Zentrix Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
