import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaRobot, FaUser, FaPlus, FaSpinner } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';

// Typewriter component: reveals text word-by-word for a smooth typing feel
const TypewriterText = ({ content, speed = 18, onComplete }) => {
    const [displayed, setDisplayed] = useState('');
    const idx = useRef(0);

    useEffect(() => {
        idx.current = 0;
        setDisplayed('');
        const timer = setInterval(() => {
            idx.current++;
            if (idx.current >= content.length) {
                setDisplayed(content);
                clearInterval(timer);
                if (onComplete) onComplete();
            } else {
                setDisplayed(content.slice(0, idx.current));
            }
        }, speed);
        return () => clearInterval(timer);
    }, [content]);

    return (
        <ReactMarkdown
            components={{
                code: ({ node, inline, className, children, ...props }) => (
                    <code className={className} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.85em'
                    }} {...props}>
                        {children}
                    </code>
                ),
                p: ({ children }) => <p style={{ margin: '0 0 1rem 0' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem' }}>{children}</ul>,
                li: ({ children }) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>
            }}
        >
            {displayed}
        </ReactMarkdown>
    );
};

const ChatWindow = ({ user, sessionId, onSessionChange, onUploadComplete }) => {
    const defaultMessages = [{ role: 'assistant', content: 'Hello! I\'m ready to help. Upload a PDF or ask me anything.' }];
    const [messages, setMessages] = useState(defaultMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [typingIdx, setTypingIdx] = useState(-1);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (typingIdx >= 0) {
            const interval = setInterval(scrollToBottom, 200);
            return () => clearInterval(interval);
        }
    }, [typingIdx]);

    useEffect(() => {
        if (!sessionId) {
            setMessages(defaultMessages);
            return;
        }

        const fetchChat = async () => {
            const docRef = doc(db, 'chats', sessionId);
            // using getDoc rather than onSnapshot for individual chats to prevent optimistic UI collisions
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                } else {
                    setMessages(defaultMessages);
                }
            } else {
                setMessages(defaultMessages);
            }
        };
        fetchChat();
    }, [sessionId]);

    const createChatSession = async (initialMessages, title) => {
        if (!user) {
            console.error("User not logged in");
            return null;
        }
        const newChat = {
            userId: user.uid,
            title: title || 'New Chat',
            messages: initialMessages,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'chats'), newChat);
        if (onSessionChange) onSessionChange(docRef.id);
        return docRef.id;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        let currentSessionId = sessionId;
        
        let newMessages = [];
        if (!currentSessionId) {
             newMessages = [defaultMessages[0], userMessage];
             setMessages(newMessages); 
             currentSessionId = await createChatSession(newMessages, input.slice(0, 30));
        } else {
             newMessages = [...messages, userMessage];
             setMessages(newMessages); 
             
             // Update title if it's the second message in the array after default message
             const shouldUpdateTitle = messages.length <= 2;
             const updateData = {
                 messages: newMessages,
                 updatedAt: serverTimestamp()
             };
             if (shouldUpdateTitle) {
                 updateData.title = input.slice(0, 30);
             }
             
             const chatRef = doc(db, 'chats', currentSessionId);
             await updateDoc(chatRef, updateData);
        }

        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8000/chat', {
                session_id: currentSessionId,
                message: userMessage.content,
                history: messages
            });

            const botMessage = { role: 'assistant', content: response.data.answer };
            setTypingIdx(newMessages.length);
            
            const updatedMessages = [...newMessages, botMessage];
            setMessages(updatedMessages); 
            
            if (currentSessionId) {
                const chatRef = doc(db, 'chats', currentSessionId);
                await updateDoc(chatRef, {
                    messages: updatedMessages,
                    updatedAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error(err);
            const errorMessage = { role: 'assistant', content: 'Sorry, I encountered an error.' };
            const updatedMessages = [...newMessages, errorMessage];
            setMessages(updatedMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        let currentSessionId = sessionId;
        
        const botMessage = { role: 'assistant', content: `Successfully uploaded: **${file.name}**. I've indexed the content and am ready to answer your questions.` };
        
        if (!currentSessionId) {
            const initialMessages = [defaultMessages[0], botMessage];
            currentSessionId = await createChatSession(initialMessages, `PDF: ${file.name}`);
            setMessages(initialMessages);
        } else {
            const chatRef = doc(db, 'chats', currentSessionId);
            await updateDoc(chatRef, {
                messages: arrayUnion(botMessage),
                updatedAt: serverTimestamp()
            });
            setMessages(prev => [...prev, botMessage]); 
        }
        
        const formData = new FormData();
        formData.append('file', file);
        if (currentSessionId) formData.append('session_id', currentSessionId);

        try {
            const response = await axios.post('http://localhost:8000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (onUploadComplete) onUploadComplete(response.data);
            
        } catch (err) {
            console.error(err);
            const errorMsg = { role: 'assistant', content: 'Failed to upload file. Please try again.' };
            if (currentSessionId) {
                 await updateDoc(doc(db, 'chats', currentSessionId), {
                      messages: arrayUnion(errorMsg),
                      updatedAt: serverTimestamp()
                 });
                 setMessages(prev => [...prev, errorMsg]);
            } else {
                 setMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            background: 'transparent',
            color: 'var(--text-primary)'
        }}>
            {/* Header */}
            <div style={{
                width: '100%',
                padding: '1.25rem 2rem',
                background: 'transparent',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '900px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>ZENTRIX ONLINE</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                padding: '0 0 2rem 0',
                scrollBehavior: 'smooth'
            }}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            width: '100%',
                            maxWidth: '900px', // Claude-style message width
                            margin: '0 auto', // Centered
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        {/* Content Container */}
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            gap: '1rem',
                            alignItems: 'flex-start'
                        }}>
                            {/* Avatar for Assistant only */}
                            {msg.role !== 'user' && (
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>
                                    <FaRobot size={16} color="rgba(255,255,255,0.5)" />
                                </div>
                            )}

                            {/* Content Bubble / Text */}
                            <div style={{
                                padding: msg.role === 'user' ? '0.75rem 1.25rem' : '0',
                                borderRadius: msg.role === 'user' ? '18px' : '0',
                                background: msg.role === 'user' ? 'rgba(30, 41, 59, 1)' : 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '1rem',
                                lineHeight: '1.6',
                                maxWidth: '100%',
                                wordBreak: 'break-word',
                                fontFamily: 'inherit'
                            }}>
                                {msg.role === 'assistant' && idx === typingIdx ? (
                                    <TypewriterText
                                        content={msg.content}
                                        speed={18}
                                        onComplete={() => setTypingIdx(-1)}
                                    />
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            code: ({ node, inline, className, children, ...props }) => (
                                                <code className={className} style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '0.2rem 0.4rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85em'
                                                }} {...props}>
                                                    {children}
                                                </code>
                                            ),
                                            p: ({ children }) => <p style={{ margin: '0 0 1rem 0' }}>{children}</p>,
                                            ul: ({ children }) => <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem' }}>{children}</ul>,
                                            li: ({ children }) => <li style={{ marginBottom: '0.5rem' }}>{children}</li>
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{
                        width: '100%',
                        maxWidth: '800px',
                        margin: '0 auto',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <FaRobot size={16} color="rgba(255,255,255,0.5)" />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                            <div className="typing-dot" style={{ background: '#3b82f6' }}></div>
                            <div className="typing-dot" style={{ background: '#3b82f6' }}></div>
                            <div className="typing-dot" style={{ background: '#3b82f6' }}></div>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <FaSpinner className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Indexing document...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: '1.5rem 0 0.5rem 0',
                background: 'transparent',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <div style={{ width: '100%', maxWidth: '900px', padding: '0 1.5rem' }}>
                    <form onSubmit={handleSend} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(30, 41, 59, 0.5)',
                        padding: '0.75rem 1rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s'
                    }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                        }}
                    >
                        {/* Integrated Upload Button */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf"
                            onChange={handleFileUpload}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            title="Upload PDF"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                        >
                            <FaPlus size={16} />
                        </button>

                        <input
                            type="text"
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: '0.75rem 0',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                            placeholder="Ask Zentrix anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{
                                background: input.trim() ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                color: input.trim() ? 'white' : 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '36px',
                                height: '36px',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FaPaperPlane size={14} />
                        </button>
                    </form>

                </div>
            </div>

            <style>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }
                .typing-dot:nth-child(1) { animation-delay: 0s; }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes typing {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default ChatWindow;
