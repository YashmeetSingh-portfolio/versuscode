import React, { useState, useEffect, useRef } from 'react';
import { useRoom } from '../context/RoomContext';
import { socketService } from '../services/socket';
import { Send, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { room, username, socket } = useRoom();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (socket) {
            const handleMessage = (msg: any) => {
                setMessages(prev => [...prev, msg]);
            };
            socket.on('new_message', handleMessage);
            return () => {
                socket.off('new_message', handleMessage);
            };
        }
    }, [socket]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !room) return;
        socketService.getSocket()?.emit('send_message', {
            roomCode: room.code,
            message,
            username
        });
        setMessage('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                    className="fixed right-0 top-16 bottom-0 w-80 chat-sidebar z-50 flex flex-col"
                >

                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <MessageSquare size={18} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs tracking-[0.2em] uppercase text-white">Comms Hub</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Secure Link</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-close">
                            <X size={16} />
                        </button>
                    </div>


                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-20">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                                    <MessageSquare size={24} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] leading-loose">No Intel<br />Transmitted Yet</p>
                            </div>
                        )}
                        {messages.map((msg, i) => {
                            const isMe = msg.username === username;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="chat-avatar text-indigo-400">
                                            {msg.username.charAt(0)}
                                        </div>
                                    </div>
                                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 mb-1 px-1">
                                            {msg.username}
                                        </span>
                                        <div className={`px-4 py-3 text-sm leading-relaxed ${isMe ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                                            {msg.message}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={scrollRef} />
                    </div>


                    <div className="p-4 bg-white/[0.02] border-t border-white/5 backdrop-blur-md">
                        <form onSubmit={handleSend} className="relative group">
                            <input
                                type="text"
                                className="input-premium pr-12 text-sm bg-black/40 border-white/5 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                placeholder="Transmit data..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center group-focus-within:scale-105 active:scale-95"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatSidebar;
