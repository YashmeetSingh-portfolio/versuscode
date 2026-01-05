import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useRoom } from '../context/RoomContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Send, Clock, BookOpen, Code, MessageSquare, CheckCircle2, XCircle, Loader2, Hourglass } from 'lucide-react';
import ChatSidebar from './ChatSidebar';

const CodingEnvironment: React.FC = () => {
    const { room, username, socket } = useRoom();
    const [code, setCode] = useState(room?.problem?.boilerplate || '');
    const [timeLeft, setTimeLeft] = useState(1800);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [mySubmission, setMySubmission] = useState<any>(null);

    useEffect(() => {
        if (room?.problem?.boilerplate && !mySubmission) {
            setCode(room.problem.boilerplate);
        }
    }, [room?.problem?.boilerplate, mySubmission]);

    useEffect(() => {
        if (!socket) return;

        socket.on('test_results', (data: any) => {
            setResults(data);
            setIsRunningTests(false);
        });

        socket.on('submission_confirmed', (data: any) => {
            setMySubmission(data);
            setIsSubmitting(false);
        });

        return () => {
            socket.off('test_results');
            socket.off('submission_confirmed');
        };
    }, [socket]);

    useEffect(() => {
        if (!room?.startTime) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - room.startTime!) / 1000);
            const remaining = Math.max(0, 1800 - elapsed);
            setTimeLeft(remaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [room?.startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRunTests = () => {
        if (!socket || !room) return;
        setIsRunningTests(true);
        setResults(null);
        socket.emit('run_tests', { roomCode: room.code, code, language: room.settings.language });
    };

    const handleSubmit = () => {
        if (!socket || !room) return;
        if (window.confirm("Are you sure? Once submitted, you cannot edit your code anymore!")) {
            setIsSubmitting(true);
            socket.emit('submit_code', { roomCode: room.code, code, language: room.settings.language });
        }
    };

    if (!room) return <div className="h-screen flex items-center justify-center">Loading Room Arena...</div>;

    if (mySubmission) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#020617' }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 max-w-lg w-full">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Submission Locked!</h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Score</div>
                            <div className="text-4xl font-bold text-indigo-400">{mySubmission.score}%</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Status</div>
                            <div className="text-xl font-bold text-emerald-400 mt-2">{mySubmission.passedAll ? 'PASSED' : 'PARTIAL'}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mb-8 flex items-center gap-4 justify-center">
                        <Hourglass size={20} className="animate-spin text-indigo-400" />
                        <span className="text-slate-300">Syncing with other players...</span>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-slate-500 italic">The Arena will transition once all warriors have submitted.</p>
                        <p className="text-[10px] text-indigo-500/50 uppercase font-bold tracking-tighter">Ranking based on accuracy then speed</p>
                    </div>
                </motion.div>
            </div>
        );
    }


    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: '#020617', color: '#f8fafc' }}>

            <header className="h-16 flex items-center justify-between px-6 glass-effect z-40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center bg-indigo-600 rounded-lg" style={{ width: '32px', height: '32px' }}>
                            <Code size={18} color="white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">CodeBattle <span className="text-indigo-500">Arena</span></h1>
                    </div>
                    <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <Clock size={16} className="text-indigo-400" />
                        <span className="font-mono text-lg font-bold text-indigo-100">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`icon-button ${isChatOpen ? 'active' : ''}`}
                        title="Toggle Battlefield Chat"
                    >
                        <MessageSquare size={18} />
                    </button>
                    <button
                        onClick={handleRunTests}
                        disabled={isRunningTests || isSubmitting}
                        className="test-button"
                    >
                        {isRunningTests ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        <span>Run Tests</span>
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isRunningTests}
                        className="btn-premium px-6 py-2.5 text-sm disabled:opacity-50 animate-glow"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                        {isSubmitting ? 'Finalizing...' : 'Submit Code'}
                    </button>
                </div>
            </header>

            <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            <main className="flex-1 flex overflow-hidden">

                <section className="side-panel" style={{ width: '400px' }}>
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="flex items-center gap-2 text-indigo-400 mb-6 font-bold uppercase tracking-widest text-[10px]">
                            <BookOpen size={14} />
                            <span>Mission Briefing</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-4 brand-gradient">{room.problem?.title || 'Loading Problem...'}</h2>
                        <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{room.problem?.description || 'Generator is thinking...'}</div>
                        {room.problem?.constraints && (
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest mb-4">Constraints</h4>
                                <div className="space-y-2">
                                    {room.problem.constraints.map((c: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-400">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5" />
                                            {c}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>


                <section className="flex-1 flex flex-col relative" style={{ background: '#020617' }}>
                    <div className="h-full w-full relative">
                        <div className="h-10 flex items-center px-4 bg-white/5 border-b border-white/5">
                            <div className="px-3 py-1 bg-white/5 rounded-t-lg border-x border-t border-white/10 text-[10px] uppercase font-bold text-indigo-400 tracking-widest">
                                {room.settings.language}.main
                            </div>
                        </div>
                        <div className="absolute inset-0 pt-10">
                            <Editor
                                height="100%"
                                defaultLanguage={room.settings.language === 'cpp' ? 'cpp' : room.settings.language === 'python' ? 'python' : 'javascript'}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono',
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    lineNumbers: 'on',
                                    automaticLayout: true,
                                    padding: { top: 20 },
                                    cursorStyle: 'line',
                                    renderLineHighlight: 'all',
                                    readOnly: isSubmitting || !!mySubmission
                                }}
                            />
                        </div>
                    </div>


                    <AnimatePresence>
                        {results && (
                            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute bottom-0 left-0 right-0 h-1/3 glass-effect" style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', overflowY: 'auto', zIndex: 100 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-sm uppercase tracking-tight">Test Results (Public)</h3>
                                        <span className={`status-tag ${results.results.every((r: any) => r.passed) ? 'success' : 'warning'}`}>
                                            {results.results.every((r: any) => r.passed) ? 'SYSTEMS NOMINAL' : 'HARDWARE FAILURE'}
                                        </span>
                                    </div>
                                    <button onClick={() => setResults(null)} className="btn-close"><XCircle size={18} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.results.map((res: any, i: number) => (
                                        <div key={i} className={`p-4 rounded-lg border ${res.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Case {i + 1}</span>
                                                {res.passed ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                                            </div>
                                            <div className="text-xs font-mono space-y-1">
                                                <div className="flex justify-between opacity-50"><span className="text-[10px]">IN:</span> <span>{res.input}</span></div>
                                                <div className="flex justify-between opacity-50"><span className="text-[10px]">EXP:</span> <span>{res.expected}</span></div>
                                                <div className="flex justify-between"><span className="text-[10px]">ACT:</span> <span className={res.passed ? 'text-emerald-400' : 'text-red-400'}>{res.actual || 'No Output'}</span></div>
                                                {res.error && <div className="text-red-500 mt-2 p-2 bg-black/40 rounded text-[9px] overflow-x-auto whitespace-pre">ERR: {res.error}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

export default CodingEnvironment;
