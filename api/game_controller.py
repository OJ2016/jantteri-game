from flask_socketio import join_room, leave_room
from game import Game
import threading
import random
import string

class GameController:
    def __init__(self, socketio):
        self.socketio = socketio
        self.games = {}
        self.lua_script = self.load_lua_script('test_activate_event.lua')
    
    def generate_random_key(self):
        """Generate random 6-letter uppercase strings."""
        return ''.join(random.choices(string.ascii_uppercase, k=6))
    
    def load_lua_script(self, filename):
        """Load Lua script from file."""
        try:
            with open(filename, 'r') as file:
                return file.read()
        except FileNotFoundError:
            print(f"Error: Could not find Lua script file: {filename}")
            return None
        except Exception as e:
            print(f"Error reading Lua script file: {e}")
            return None
    
    def run_game_loop(self, game_id, script):
        """Run a game loop in a separate thread."""
        self.games[game_id]['game'].set_script(script)
        self.games[game_id]['game'].run_script()
    
    def get_all_games(self):
        """Get list of all game IDs."""
        return list(self.games.keys())
    
    def get_game_info(self, game_id):
        """Get information about a specific game."""
        if game_id not in self.games:
            return None
        return {
            'game_id': game_id,
            'status': 'running',
            'message': 'Connect to WebSocket and join room with this game_id to receive console output'
        }
    
    def create_game(self):
        """Create a new game instance and return its ID."""
        if self.lua_script is None:
            return None, "Lua script not available - Could not load default Lua script"
        
        # Generate a new random key
        new_game_id = self.generate_random_key()
        
        # Ensure the key is unique
        while new_game_id in self.games:
            new_game_id = self.generate_random_key()
        
        # Create new game instance with WebSocket support
        game_instance = Game(game_id=new_game_id, socketio=self.socketio)
        
        # Start the game loop with default script
        game_thread = threading.Thread(
            target=self.run_game_loop, 
            args=(new_game_id, self.lua_script), 
            daemon=True
        )
        
        # Store both game and thread in the games dictionary
        self.games[new_game_id] = {
            'game': game_instance,
            'thread': game_thread
        }
        
        game_thread.start()
        
        return new_game_id, None
    
    def end_game(self, game_id):
        """End/stop a specific game."""
        if game_id not in self.games:
            return False, "Game not found"
        
        # Signal the game to stop
        self.games[game_id]['game'].stop()
        
        # Wait a moment for the game to stop gracefully
        game_thread = self.games[game_id]['thread']
        game_thread.join(timeout=5)  # Wait up to 5 seconds
        
        # Remove the game from games dictionary
        del self.games[game_id]
        
        return True, "Game ended successfully"
    
    def join_game_room(self, game_id):
        """Handle client joining a game room."""
        if game_id and game_id in self.games:
            join_room(game_id)
            return True, f'Joined game room {game_id}'
        else:
            return False, 'Game not found'
    
    def leave_game_room(self, game_id):
        """Handle client leaving a game room."""
        if game_id:
            leave_room(game_id)
            return True, f'Left game room {game_id}'
        return False, 'Invalid game ID'