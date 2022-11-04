import { events } from "../context/app-events";

export function registerGamepadEvents(){
    let updating = false;
    function update(){  
        if(updating){
            const gps = navigator.getGamepads();
            for (const gp of gps) {
                if(gp){ 
                    events.gamepad.update.fire(gp) 
                }
            }
            requestAnimationFrame(update)
        }
    }

    function gamepadconnected(e){
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
          e.gamepad.index, e.gamepad.id,
          e.gamepad.buttons.length, e.gamepad.axes.length);
          
        const gps = navigator.getGamepads();
        const gp = [e.gamepad.index];  
        events.gamepad.connect.fire(gp); 

        if(!updating){
            for (const gp of gps) {
                if(gp){
                    updating = true;
                    update()
                    break;
                }
            }
        }
    }
    function gamepaddisconnected(e){
        console.log("Gamepad disconnected from index %d: %s",
          e.gamepad.index, e.gamepad.id);
          events.gamepad.disconnect.fire(e.gamepad);

          if(updating){
            let hasGamepad = false;
            const gps = navigator.getGamepads();
            for (const gp of gps) {
                if(gp){
                    hasGamepad = true;
                }
            }
            if(!hasGamepad){
                updating = false;
            }
          }
    }
    window.addEventListener("gamepadconnected", gamepadconnected);
    window.addEventListener("gamepaddisconnected", gamepaddisconnected); 
    
    return () => {
        updating= false;
        window.removeEventListener("gamepadconnected", gamepadconnected);
        window.removeEventListener("gamepaddisconnected", gamepaddisconnected); 
    }
}