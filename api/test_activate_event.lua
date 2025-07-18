-- Test script to demonstrate sending activate events

print("Starting activate event test...")

-- Repeat the activate requests forever
local round = 1
while true do
    print("Round " .. round .. " of activate events")
    
    -- Send an activate event to device 1 with no delay
    send_activate_event(1)
    
    -- Wait 2 seconds
    wait(2)
    
    -- Send an activate event to device 2 with a 1.5 second delay
    send_activate_event(2, 1.5)
    
    -- Wait another 2 seconds
    wait(2)
    
    -- Send an activate event to device 3 with a 0.5 second delay
    send_activate_event(3, 0.5)
    
    -- Wait before next round
    print("Waiting before next round...")
    wait(3)
    
    round = round + 1
end
