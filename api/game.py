import lupa
from lupa import LuaRuntime
import time
import json
from google.protobuf.json_format import MessageToDict

from protobuild import jantteri_messages_pb2

class Game:
    def __init__(self, game_id=None, socketio=None):
        """Initialize a new Lua runtime instance."""
        self.lua = LuaRuntime(unpack_returned_tuples=True)
        self.game_id = game_id
        self.socketio = socketio
        self._setup_lua_environment()
        self.lua_script= None
        self.should_stop = False
    
    def _setup_lua_environment(self):
        """Set up the Lua environment with any required globals or functions."""
        # Add any common functions or variables that all Lua scripts should have access to
        self.lua.globals()['print'] = self._lua_print
        self.lua.globals()['wait'] = self._lua_wait
        self.lua.globals()['send_activate_event'] = self._lua_send_activate_event
    
    def _check_stop_condition(self):
        """Check if the game should stop and raise exception if so."""
        if self.should_stop:
            raise Exception("Game stopped")
    
    def _lua_print(self, *args):
        """Custom print function that emits output to WebSocket room."""
        self._check_stop_condition()
        message = ' '.join(str(arg) for arg in args)
        
        if self.socketio and self.game_id:
            self.socketio.emit('console_output', {
                'message': message,
                'game_id': self.game_id,
                'timestamp': time.time()
            }, room=self.game_id)
    
    def _lua_wait(self, seconds):
        """Custom wait function that calls Python's time.sleep and checks stop condition."""
        self._check_stop_condition()
        
        # Sleep in small increments to check stop condition more frequently
        sleep_increment = 0.5  # Check every 500ms
        remaining_time = seconds
        
        while remaining_time > 0 and not self.should_stop:
            sleep_time = min(sleep_increment, remaining_time)
            time.sleep(sleep_time)
            remaining_time -= sleep_time
        
        # Check stop condition at the end as well
        self._check_stop_condition()
    
    def stop(self):
        """Signal the game to stop."""
        self.should_stop = True
    
    def set_script(self, script_content):
        """Set the Lua script content."""
        self.lua_script = script_content

    def run_script(self):
        """Run the loaded Lua script."""
        if self.lua_script:
            try:
                self.lua.execute(self.lua_script)
            except Exception as e:
                print(f"Error running Lua script: {e}")
        else:
            print("No Lua script loaded.")
    
    def _lua_send_activate_event(self, device_id, delay=None):
        """Create and send a jantteri_event with ACTIVATE_REQUEST event type."""
        self._check_stop_condition()
        
        # Handle default delay parameter
        if delay is None:
            delay = 0.0
        
        try:
            # Create the jantteri_event message
            event = jantteri_messages_pb2.jantteri_event()
            event.device_id = int(device_id)
            event.event = jantteri_messages_pb2.ACTIVATE_REQUEST  # Use the ACTIVATE_REQUEST enum value
            event.timestamp = int(time.time())  # Timestamp in seconds since epoch
            event.delay = float(delay)
            
            # Convert protobuf message to dict using protobuf's built-in function
            event_dict = MessageToDict(event)
            
            # Send to socketio room with topic 'jantteri_event'
            if self.socketio and self.game_id:
                self.socketio.emit('jantteri_event', event_dict, room=self.game_id)
        
        except Exception as e:
            error_msg = f"Error creating jantteri_event: {e}"
            if self.socketio and self.game_id:
                self.socketio.emit('console_output', {
                    'message': error_msg,
                    'game_id': self.game_id,
                    'timestamp': time.time()
                }, room=self.game_id)
            print(error_msg)