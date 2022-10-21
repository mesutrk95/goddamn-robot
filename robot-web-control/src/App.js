 
import styles from './App.module.scss';

import socketio from "socket.io-client";     
import {mountGamepadEvents} from './gamepad';
import SocketContext from './context/socket-context';
import GamepadContext from './context/gamepad-context';
  

import ControlRobot from './ControlRobot'; 
import { useEffect, useState } from 'react';

import Navbar from './Navbar';
import CameraPreview from "./CameraPreview";
import { events } from "./app-events"; 

function App() {   
  const [socket, setSocket] = useState({connected : false});     
 
    useEffect(()=>{
      const unregister = mountGamepadEvents();
      return ()=>{
        unregister()
      }
    }) 
  
  function disconnectSocket(){
    if(socket.connected){
      socket.io.disconnect() 
      console.log('disconnected from ' + socket.io.uri); 
    } 
  }

  function connectSocket(host, port){ 
    disconnectSocket()

    console.log('init socket', host + ':' + port);
    const client = socketio.connect(host + ':' + port); 
    // setGamepad('init socket')
    // setSocket(client);

    client.on('connect', ()=>{
      // setSocket(client);
      console.log('connected to ' + client.io.uri ,client);
      setSocket({connected : true, uri: client.io.uri, io : client})
      // setGamepad('connected to ' + client.io.uri)
      events.socket.connect.fire()
    })
    client.on('disconnect', ()=>{
      console.log('disconnected ' + client.io.uri);  
      // setGamepad('disconnected ' + client.io.uri) 
      setSocket({connected : false, io : client})
      events.socket.disconnect.fire()
    })
    client.on('video', (data)=>{ 
      events.socket.cameraData.fire(data)
    })
    client.on('status', (data)=>{ 
      events.socket.deviceStatus.fire(data)
    })
  }

  useEffect(()=>{  
    connectSocket(localStorage.getItem('host') || 'localhost', localStorage.getItem('port') || '5123'); 

    return ()=>{ 
      disconnectSocket();
      events.socket.disconnect.fire()
    }
  }, [])


  return (
    // <GamepadContext.Provider value={''}>
      <SocketContext.Provider value={socket}>
        <div className="App" >
          {/* <ControlRobot /> */}
          <CameraPreview>
            <Navbar connectSocket={(host, port) => connectSocket(host, port)}>  
            </Navbar>
          </CameraPreview>
        </div>
      </SocketContext.Provider>
    // </GamepadContext.Provider>
  );
}

export default App;
