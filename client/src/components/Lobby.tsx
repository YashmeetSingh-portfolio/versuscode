import React from 'react';
import { useRoom } from '../context/RoomContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Play, CheckCircle2, User, Layout, ArrowLeft } from 'lucide-react';

const Lobby: React.FC = () => {
    const { room, socket, username } = useRoom();

    const [copied, setCopied] = React.useState(false);

    const copyCode = () => {
        if (room?.code) {
            navigator.clipboard.writeText(room.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleStart = () => {
        if (room?.host === socket?.id) {
            socket.emit('start_competition', { roomCode: room?.code });
        }

    };

    if (!room) return null;

    const isHost = room.host === socket?.id;

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid lg:grid-cols-3 gap-8"
            >

                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Room Lobby</h1>
                                <p className="text-slate-400">Waiting for challengers to join the arena</p>
                            </div>
                            <div className="flex flex-col items-end relative">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Access Key</span>
                                <div className="flex items-center gap-3 p-1.5 bg-black/20 rounded-xl border border-white/5">
                                    <span className="font-mono text-xl font-bold tracking-[0.3em] text-indigo-400 pl-3">{room.code}</span>
                                    <button
                                        onClick={copyCode}
                                        className="btn-icon-subtle"
                                        title="Copy Room Code"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {copied && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-lg shadow-emerald-500/20"
                                        >
                                            Key Copied!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Difficulty</span>
                                <span className="text-lg font-semibold">{room.settings.difficulty}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Language</span>
                                <span className="text-lg font-semibold capitalize">{room.settings.language}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Participants</span>
                                <span className="text-lg font-semibold">{room.users.length} / 10</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="text-indigo-400" />
                            <h2 className="text-xl font-bold">Challengers</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {room.users.map((user) => (
                                <motion.div
                                    layout
                                    key={user.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border ${user.id === socket?.id
                                        ? 'bg-indigo-500/10 border-indigo-500/30'
                                        : 'bg-white/5 border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{user.username}</p>
                                            <p className="text-xs text-slate-500">{user.id === room.host ? 'Room Master' : 'Challenger'}</p>
                                        </div>
                                    </div>
                                    {user.isReady ? (
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    ) : (
                                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>


                <div className="space-y-6">
                    <div className="glass-card p-8 bg-indigo-600/5 border-indigo-500/20">
                        <h3 className="font-bold mb-4">Master Controls</h3>
                        {isHost ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6">
                                    As the host, you can start the competition once everyone is ready.
                                </p>
                                <button
                                    onClick={handleStart}
                                    className="btn-premium w-full animate-glow"
                                    style={{ padding: '1rem' }}
                                >
                                    <Play size={20} />
                                    Begin Battle
                                </button>

                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 mb-6 text-center">
                                    Waiting for the host to start the competition...
                                </p>
                                <div className="flex justify-center">
                                    <div className="flex gap-1">
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 border-white/5">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Tips</h4>
                        <ul className="text-xs text-slate-400 space-y-3">
                            <li className="flex gap-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1" />
                                Speed and accuracy both count towards your final score.
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1" />
                                Use the built-in chat to discuss strategies or distract rivals.
                            </li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;
