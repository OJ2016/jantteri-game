import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string, room?: string) {
    const [messages, setMessages] = useState<string[]>([]);
    const [status, setStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Create Socket.IO connection
        const socketConnection = io(url);
        setSocket(socketConnection);

        socketConnection.on('connect', () => {
            setStatus('Connected');

            // Join the game room when connected
            if (room) {
                socketConnection.emit('join_game', { game_id: room });
            }
        });

        socketConnection.on('disconnect', () => {
            setStatus('Disconnected');
        });

        // Listen for status messages
        socketConnection.on('status', (data) => {
            setMessages(prev => [...prev, `Status: ${data.message}`]);
        });

        // Listen for console output (this is what your game sends)
        socketConnection.on('console_output', (data) => {
            setMessages(prev => [...prev, data.message || data]);
        });

        // Listen for any other messages
        socketConnection.on('message', (data) => {
            setMessages(prev => [...prev, JSON.stringify(data)]);
        });

        // Listen for errors
        socketConnection.on('error', (data) => {
            setMessages(prev => [...prev, `Error: ${data.message}`]);
        });

        return () => {
            if (room) {
                socketConnection.emit('leave_game', { game_id: room });
            }
            socketConnection.disconnect();
        };
    }, [url, room]);

    return { messages, status, socket };
}