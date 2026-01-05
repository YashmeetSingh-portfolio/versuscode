import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socket';

interface User {
    id: string;
    username: string;
    isReady: boolean;
}

interface Room {
    code: string;
    host: string;
    users: User[];
    settings: any;
    status: 'lobby' | 'reading' | 'coding' | 'finished';
    problem: any;
    startTime?: number;
}

interface RoomContextType {
    room: Room | null;
    username: string;
    loading: boolean;
    socket: any;
    standings: any[] | null;
    setUsername: (name: string) => void;
    createRoom: (settings: any) => void;
    joinRoom: (code: string) => void;
    startCompetition: () => void;
    submitCode: (code: string, language: string) => void;
}



const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [standings, setStandings] = useState<any[] | null>(null);
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        socketService.connect();
        const newSocket = socketService.getSocket();
        setSocket(newSocket);

        if (newSocket) {
            const handleRoomCreated = (newRoom: Room) => setRoom(newRoom);
            const handleRoomJoined = (updatedRoom: Room) => setRoom(updatedRoom);
            const handleUserJoined = (user: User) => {
                setRoom(prev => {
                    if (!prev) return null;
                    if (prev.users.find(u => u.id === user.id)) return prev;
                    return { ...prev, users: [...prev.users, user] };
                });
            };
            const handleCompetitionLoading = () => setLoading(true);
            const handleStartCoding = (data: { problem?: any, startTime: number }) => {
                setLoading(false);
                setRoom(prev => prev ? {
                    ...prev,
                    status: 'coding',
                    startTime: data.startTime,
                    problem: data.problem || prev.problem
                } : null);
                setStandings(null);
            };
            const handleCompetitionFinished = (data: { standings: any[] }) => {
                setStandings(data.standings);
                setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
            };

            newSocket.on('room_created', handleRoomCreated);
            newSocket.on('room_joined', handleRoomJoined);
            newSocket.on('user_joined', handleUserJoined);
            newSocket.on('competition_loading', handleCompetitionLoading);
            newSocket.on('start_coding', handleStartCoding);
            newSocket.on('competition_finished', handleCompetitionFinished);

            return () => {
                newSocket.off('room_created', handleRoomCreated);
                newSocket.off('room_joined', handleRoomJoined);
                newSocket.off('user_joined', handleUserJoined);
                newSocket.off('competition_loading', handleCompetitionLoading);
                newSocket.off('start_coding', handleStartCoding);
                newSocket.off('competition_finished', handleCompetitionFinished);
                socketService.disconnect();
            };
        }
    }, []);

    const createRoom = (settings: any) => {
        socketService.getSocket()?.emit('create_room', { username, settings });
    };

    const joinRoom = (roomCode: string) => {
        socketService.getSocket()?.emit('join_room', { username, roomCode });
    };

    const startCompetition = () => {
        if (room) {
            socketService.getSocket()?.emit('start_competition', { roomCode: room.code });
        }
    };

    const submitCode = (code: string, language: string) => {
        if (room) {
            socketService.getSocket()?.emit('submit_code', { roomCode: room.code, code, language });
        }
    };



    return (
        <RoomContext.Provider value={{ room, username, loading, socket, standings, setUsername, createRoom, joinRoom, startCompetition, submitCode }}>
            {children}
        </RoomContext.Provider>
    );
};



export const useRoom = () => {
    const context = useContext(RoomContext);
    if (!context) throw new Error('useRoom must be used within a RoomProvider');
    return context;
};
