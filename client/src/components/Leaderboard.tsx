import React from 'react';
import { useRoom } from '../context/RoomContext';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Medal, ArrowRight } from 'lucide-react';

const Leaderboard: React.FC = () => {
    const { standings } = useRoom();

    if (!standings) return <div className="h-screen flex items-center justify-center">Calculating Final Rankings...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 rounded-2xl mb-4 border border-amber-500/20">
                    <Trophy size={32} className="text-amber-400" />
                </div>
                <h1 className="text-4xl font-bold mb-2 brand-gradient">{standings[0].username} is the Winner!</h1>
                <p className="text-slate-400">The battle has ended. Here are the final rankings.</p>
            </motion.div>

            <div className="space-y-4">
                {standings.map((user, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`glass-card p-6 flex items-center justify-between relative overflow-hidden ${index === 0 ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : ''}`}
                    >
                        {index === 0 && (
                            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                        )}

                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl border ${index === 0 ? 'bg-amber-500/20 border-amber-500/40' : 'bg-white/5 border-white/10'}`}>
                                {index === 0 ? <Medal className="text-amber-400" size={24} /> : <span className="font-bold text-slate-500">#{index + 1}</span>}
                            </div>


                            <div>
                                <h3 className="text-lg font-bold">{user.username}</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock size={12} />
                                        {Math.floor(user.timeTaken / 60)}m {user.timeTaken % 60}s
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Target size={12} />
                                        {user.passedAll ? 'All Tests Passed' : `${user.score}% Score`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-400">{user.score}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Points</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
            >
                <button
                    onClick={() => window.location.reload()}
                    className="btn-premium inline-flex items-center gap-2"
                >
                    Return to Lobby <ArrowRight size={18} />
                </button>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
