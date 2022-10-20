 
import styles from './App.module.scss';

import socketio from "socket.io-client";     
import {mountGamepadEvents} from './gamepad';
import SocketContext from './context/socket-context';
import GamepadContext from './context/gamepad-context';
  

import ControlRobot from './ControlRobot'; 
import { useCallback, useEffect, useState } from 'react';

import Navbar from './Navbar';
import CameraPreview from "./CameraPreview";
import { events } from "./app-events"; 

function App() {   
  const [socket, setSocket] = useState(null);   
  const [gamepad, setGamepad] = useState(null); 


    // const keyDown = useCallback( e  => {
    //     console.log('key-down', this, socket); 
    // }, [ ]);
    // const keyUp = useCallback( e  => {
    //     console.log('key-up', this, socket );  
    // }, [ ]);

    useEffect(()=>{
      const unregister = mountGamepadEvents();
      return ()=>{
        unregister()
      }
    })
    // useEffect(() => { 
    

    //     window.addEventListener("keydown", keyDown);  
    //     window.addEventListener("keyup", keyUp);  
 
    //     return ()=>{
    //         window.removeEventListener("keydown", keyDown); 
    //         window.removeEventListener("keyup", keyUp);  
    //     }
    // }, [])

  
  function disconnectSocket(){
    if(socket){
      socket.disconnect() 
      console.log('disconnected from ' + socket.io.uri); 
    } 
  }

  function connectSocket(host, port){ 
    disconnectSocket()

    const client = socketio.connect(host + ':' + port); 
    setSocket(client);

    client.on('connect', ()=>{
      // setSocket(client);
      console.log('connected to ' + client.io.uri); 
      events.socket.connect.fire()
    })
    client.on('disconnect', ()=>{
      console.log('disconnected from ' + client.io.uri); 
      events.socket.disconnect.fire()
    })
    client.on('video', (data)=>{ 
      events.socket.cameraData.fire(data)
    })
  }
  useEffect(()=>{ 
    // window.addEventListener("gamepadconnected", (e) => {
    //   console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    //     e.gamepad.index, e.gamepad.id,
    //     e.gamepad.buttons.length, e.gamepad.axes.length);
        
    //   const gp = navigator.getGamepads()[e.gamepad.index];
    //   console.log(gp);
    //   setGamepad(gp) 
    // });
    // window.addEventListener("gamepaddisconnected", (e) => {
    //   console.log("Gamepad disconnected from index %d: %s",
    //     e.gamepad.index, e.gamepad.id);
    // }); 
    connectSocket(localStorage.getItem('host') || 'localhost', localStorage.getItem('port') || '5123'); 

    return ()=>{ 
      disconnectSocket();
      events.socket.disconnect.fire()
    }
  }, [])


  return (
    <GamepadContext.Provider value={gamepad}>
      <SocketContext.Provider value={socket}>
        <div className="App" >
          <Navbar connectSocket={(host, port) => connectSocket(host, port)}> 
              {/* <div>{gamepads && (gamepads.axes) }</div> */}
          </Navbar>
          <ControlRobot />
          <CameraPreview />
        </div>
      </SocketContext.Provider>
    </GamepadContext.Provider>
  );
}

export default App;
