import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(url: string, room?: string) {
    const [status, setStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Disconnected');
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Don't create connection if no URL provided
        if (!url) {
            setSocket(null);
            setStatus('Disconnected');
            return;
        }

        setStatus('Connecting');

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

        socketConnection.on('connect_error', () => {
            setStatus('Disconnected');
        });

        return () => {
            if (socketConnection) {
                if (room) {
                    socketConnection.emit('leave_game', { game_id: room });
                }
                socketConnection.disconnect();
            }
        };
    }, [url, room]);

    return { status, socket };
}