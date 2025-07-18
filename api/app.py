from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from game_controller import GameController

# Create Flask application instance
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
CORS(app)  # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# Create GameController instance
game_controller = GameController(socketio)

@app.route('/', methods=['GET'])
def root():
    """
    Root endpoint for basic health check
    """
    return jsonify({
        'message': 'Jantteri Game Controller - Lua Script Engine with WebSocket API',
        'status': 'running',
        'game_ids': game_controller.get_all_games()
    })

@app.route('/<string:game_id>', methods=['GET'])
def get_game_info(game_id):
    """
    Get information about a specific game
    """
    game_info = game_controller.get_game_info(game_id)
    if game_info is None:
        return jsonify({
            'error': 'Game not found',
            'available_games': game_controller.get_all_games()
        }), 404
    
    return jsonify(game_info)

@app.route('/create', methods=['GET'])
def create_game():
    """
    Create a new game instance via GET request and return its ID
    """
    game_id, error = game_controller.create_game()
    
    if error:
        return jsonify({
            'error': 'Lua script not available',
            'message': error
        }), 500
    
    return jsonify({
        'message': 'Game created successfully',
        'game_id': game_id,
        'status': 'running',
        'access_url': f'/{game_id}'
    })

@app.route('/<string:game_id>/end', methods=['GET'])
def end_game(game_id):
    """
    End/stop a specific game
    """
    success, message = game_controller.end_game(game_id)
    
    if not success:
        return jsonify({
            'error': 'Game not found',
            'available_games': game_controller.get_all_games()
        }), 404
    
    return jsonify({
        'message': message,
        'game_id': game_id,
        'status': 'stopped'
    })

# WebSocket event handlers
@socketio.on('join_game')
def on_join_game(data):
    """Handle client joining a game room."""
    game_id = data.get('game_id')
    success, message = game_controller.join_game_room(game_id)
    
    if success:
        emit('status', {
            'message': message,
            'game_id': game_id
        })
    else:
        emit('error', {
            'message': message,
            'available_games': game_controller.get_all_games()
        })

@socketio.on('leave_game')
def on_leave_game(data):
    """Handle client leaving a game room."""
    game_id = data.get('game_id')
    success, message = game_controller.leave_game_room(game_id)
    
    emit('status', {
        'message': message,
        'game_id': game_id
    })

@socketio.on('connect')
def on_connect():
    """Handle client connection."""
    emit('status', {
        'message': 'Connected to Jantteri Game Controller WebSocket',
        'available_games': game_controller.get_all_games()
    })

if __name__ == '__main__':
    print("Starting Jantteri Game Controller - Lua Script Engine with WebSocket support...")
    
    if game_controller.lua_script is None:
        print("WARNING: Could not load default Lua script from default_script.lua")
        print("Game creation will be unavailable until the script file is fixed")
    else:
        print("Default Lua script loaded successfully from default_script.lua")
    
    print("No games running initially - create games using /create endpoint")
    print("Visit http://localhost:5000/create to create a new game")
    print("Visit http://localhost:5000/{game_id}/end to stop a game")
    print("Visit http://localhost:5000/ to see all available games")
    print("Connect to WebSocket and join game rooms to receive console output")
    
    # Run the Flask-SocketIO application
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
