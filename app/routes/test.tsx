import { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Test() {
    const [gameId, setGameId] = useState('VVUKUI');
    const [inputValue, setInputValue] = useState('VVUKUI');
    const [isConnected, setIsConnected] = useState(false);

    const { messages, status } = useWebSocket(
        isConnected ? 'http://localhost:5000' : '',
        isConnected ? gameId : undefined
    );

    const handleConnect = () => {
        setGameId(inputValue);
        setIsConnected(true);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Game Console</h1>

            {/* Game ID Input */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                    Game ID:
                </label>
                <div className="flex gap-2">
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