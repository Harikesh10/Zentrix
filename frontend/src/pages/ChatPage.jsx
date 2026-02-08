import React, { useState } from 'react';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
    const [sessionData, setSessionData] = useState(null);

    return (
        <div className="flex flex-col h-screen w-full bg-[#020617] overflow-hidden">
            <header className="p-4 px-8 flex items-baseline gap-4 bg-transparent z-10">
                <h1 className="text-xl font-extrabold text-slate-50 tracking-tighter cursor-pointer" onClick={() => window.location.href = '/'}>
                    Zentrix<span className="text-blue-500">AI</span>
                </h1>
                <p className="text-sm opacity-50 text-slate-400">Professional AI study companion</p>
            </header>

            <main className="flex-1 w-full flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col w-full h-full relative">
                    <ChatWindow
                        sessionId={sessionData?.session_id}
                        onUploadComplete={(data) => setSessionData(data)}
                    />
                </div>
            </main>


        </div>
    );
};

export default ChatPage;
