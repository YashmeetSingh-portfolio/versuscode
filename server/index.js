require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateProblem } = require('./services/aiService');
const { executeCode } = require('./services/executionService');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ username, settings }) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = {
            code: roomCode,
            host: socket.id,
            users: [{ id: socket.id, username, isReady: false }],
            settings,
            status: 'lobby',
            problem: null,
            startTime: null,
            submissions: {}
        };
        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.emit('room_created', room);
    });

    socket.on('join_room', ({ username, roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room) return socket.emit('error', 'Room not found');
        room.users.push({ id: socket.id, username, isReady: false });
        socket.join(roomCode);
        socket.emit('room_joined', room);
        socket.to(roomCode).emit('user_joined', { id: socket.id, username });
    });

    socket.on('start_competition', async ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room || room.host !== socket.id) return;

        try {
            io.to(roomCode).emit('competition_loading');
            const problem = await generateProblem(room.settings);
            room.problem = problem;
            room.status = 'coding';
            room.startTime = Date.now();
            room.submissions = {};

            io.to(roomCode).emit('start_coding', {
                problem,
                startTime: room.startTime
            });
        } catch (error) {
            io.to(roomCode).emit('error', 'Failed to generate problem');
        }
    });

    socket.on('run_tests', async ({ roomCode, code, language }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.problem) return;

        try {
            const results = [];
            const publicCases = room.problem.test_cases.filter(tc => !tc.hidden);
            const fullCode = code + "\n\n" + (room.problem.execution_wrapper || "");

            for (const testCase of publicCases) {
                const run = await executeCode(language, fullCode, testCase.input);
                results.push({
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: run.stdout.trim(),
                    error: run.stderr,
                    passed: run.stdout.trim() === testCase.expected.trim(),
                    hidden: false
                });
            }
            socket.emit('test_results', { results });
        } catch (error) {
            socket.emit('error', 'Test execution failed');
        }
    });

    socket.on('submit_code', async ({ roomCode, code, language }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.problem || room.submissions[socket.id]) return;

        try {
            const results = [];
            let passedCount = 0;
            const fullCode = code + "\n\n" + (room.problem.execution_wrapper || "");

            for (const testCase of room.problem.test_cases) {
                const run = await executeCode(language, fullCode, testCase.input);
                const passed = run.stdout.trim() === testCase.expected.trim();
                if (passed) passedCount++;
                results.push({ passed, hidden: testCase.hidden });
            }

            const score = Math.round((passedCount / room.problem.test_cases.length) * 100);
            const user = room.users.find(u => u.id === socket.id);

            room.submissions[socket.id] = {
                username: user?.username,
                score,
                passedAll: passedCount === room.problem.test_cases.length,
                timeTaken: Math.floor((Date.now() - room.startTime) / 1000)
            };

            socket.emit('submission_confirmed', { score, passedAll: passedCount === room.problem.test_cases.length });

            if (Object.keys(room.submissions).length === room.users.length) {
                room.status = 'finished';
                io.to(roomCode).emit('competition_finished', {
                    standings: Object.values(room.submissions).sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
                });
            }
        } catch (error) {
            socket.emit('error', 'Submission failed');
        }
    });



    socket.on('send_message', ({ roomCode, message, username }) => {
        io.to(roomCode).emit('new_message', { username, message, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});
