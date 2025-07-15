import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import {
    jantteri_event,
    jantteri_state,
    jantteri_config,
    jantteri_hit_debug,
    jantteri_pid_debug,
    jantteri_event_type,
    jantteri_target_state
} from '../../jantteri-messages/build/typescript/jantteri_messages';

export default function Test() {
    const [gameId, setGameId] = useState('VVUKUI');
    const [inputValue, setInputValue] = useState('VVUKUI');
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);
    const [isCreatingGame, setIsCreatingGame] = useState(false);

    // Message formatters
    const formatters = {
        event: (data: jantteri_event) => {
            const eventName = jantteri_event_type[data.event] || `UNKNOWN(${data.event})`;
            return `Device ${data.deviceId}: ${eventName} (${new Date(data.timestamp * 1000).toLocaleTimeString()})`;
        },

        state: (data: jantteri_state) => {
            const stateName = jantteri_target_state[data.targetState] || `UNKNOWN(${data.targetState})`;
            return `Target State: ${stateName}`;
        },

        config: (data: jantteri_config) => {
            return `Config: Active=${data.activePotVal}, Inactive=${data.inactivePotVal}, Colors=[${data.color1}, ${data.color2}]`;
        },

        hit_debug: (data: jantteri_hit_debug) => {
            return `Hit Debug: Count=${data.hitCount}, L=${data.hitTimesLeft?.length || 0}, C=${data.hitTimesCenter?.length || 0}, R=${data.hitTimesRight?.length || 0}`;
        },

        pid_debug: (data: jantteri_pid_debug) => {
            return `PID: Pos=${data.pos.toFixed(2)}, Speed=${data.spd.toFixed(2)}, Target=${data.posSetPoint.toFixed(2)}`;
        }
    };

    const { status, socket } = useWebSocket(
        isConnected ? 'http://localhost:5000' : '',
        isConnected ? gameId : undefined
    );

    // Handle all Socket.IO event listeners in the component
    useEffect(() => {
        if (!socket) return;

        const handleJantteriEvent = (data: jantteri_event) => {
            const formatted = formatters.event(data);
            setMessages(prev => [...prev, formatted]);
        };

        const handleJantteriState = (data: jantteri_state) => {
            const formatted = formatters.state(data);
            setMessages(prev => [...prev, formatted]);
        };

        const handleJantteriConfig = (data: jantteri_config) => {
            const formatted = formatters.config(data);
            setMessages(prev => [...prev, formatted]);
        };

        const handleJantteriHitDebug = (data: jantteri_hit_debug) => {
            const formatted = formatters.hit_debug(data);
            setMessages(prev => [...prev, formatted]);
        };

        const handleJantteriPidDebug = (data: jantteri_pid_debug) => {
            const formatted = formatters.pid_debug(data);
            setMessages(prev => [...prev, formatted]);
        };

        const handleConsoleOutput = (data: any) => {
            setMessages(prev => [...prev, `Console: ${data.message || JSON.stringify(data)}`]);
        };

        const handleError = (data: any) => {
            setMessages(prev => [...prev, `Error: ${data.message || JSON.stringify(data)}`]);
        };

        // Set up event listeners
        socket.on('jantteri_event', handleJantteriEvent);
        socket.on('jantteri_state', handleJantteriState);
        socket.on('jantteri_config', handleJantteriConfig);
        socket.on('jantteri_hit_debug', handleJantteriHitDebug);
        socket.on('jantteri_pid_debug', handleJantteriPidDebug);
        socket.on('console_output', handleConsoleOutput);
        socket.on('error', handleError);

        // Cleanup event listeners
        return () => {
            socket.off('jantteri_event', handleJantteriEvent);
            socket.off('jantteri_state', handleJantteriState);
            socket.off('jantteri_config', handleJantteriConfig);
            socket.off('jantteri_hit_debug', handleJantteriHitDebug);
            socket.off('jantteri_pid_debug', handleJantteriPidDebug);
            socket.off('console_output', handleConsoleOutput);
            socket.off('error', handleError);
        };
    }, [socket]);

    const createGame = async () => {
        setIsCreatingGame(true);
        try {
            const response = await fetch('http://localhost:5000/create', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.game_id) {
                setInputValue(data.game_id);
                setMessages(prev => [...prev, `Game created successfully: ${data.game_id} (${data.status})`]);
            }
        } catch (error) {
            console.error('Failed to create game:', error);
            setMessages(prev => [...prev, `Error creating game: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        } finally {
            setIsCreatingGame(false);
        }
    };

    const handleConnect = () => {
        setGameId(inputValue);
        setIsConnected(true);
        setMessages([]); // Clear messages when connecting
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setMessages([]); // Clear messages when disconnecting
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Game Console</h1>

            {/* Game ID Input */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Game ID:
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                        placeholder="Enter Game ID (e.g., VVUKUI)"
                        disabled={isConnected}
                        maxLength={6}
                    />
                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            disabled={!inputValue.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Connect
                        </button>
                    ) : (
                        <button
                            onClick={handleDisconnect}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Disconnect
                        </button>
                    )}
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={createGame}
                        disabled={isConnected || isCreatingGame}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isCreatingGame ? 'Creating...' : 'Create New Game'}
                    </button>
                </div>
            </div>

            {/* Connection Status */}
            {isConnected && (
                <div className="mb-4">
                    <p className="mb-2">
                        <strong>Connected to Game:</strong> {gameId}
                    </p>
                    <p className="mb-4">
                        Status: <span className={status === 'Connected' ? 'text-green-600' : 'text-red-600'}>
                            {status}
                        </span>
                    </p>
                </div>
            )}

            {/* Messages Display */}
            <div className="border rounded p-4 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                {!isConnected ? (
                    <p className="text-gray-500">Enter a Game ID and click Connect to start receiving messages...</p>
                ) : messages.length === 0 ? (
                    <p className="text-gray-500">Waiting for messages from game {gameId}...</p>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-700 rounded font-mono text-sm">
                            {message}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}