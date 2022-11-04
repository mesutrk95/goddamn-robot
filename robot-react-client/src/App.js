 
import styles from './App.module.scss';

import React, { useEffect, useState } from 'react';
import { events } from "./context/app-events"; 
import { registerGamepadEvents } from './utils/gamepad';  
import socketio from "socket.io-client";     

import CameraPreview from "./components/CameraPreview";
import ControlRobot from './components/ControlRobot'; 
import Navbar from './components/Navbar';

import SocketContext from './context/socket-context'; 

function App() {   
  const [socket, setSocket] = useState({connected : false});     
 
    useEffect(()=>{
      const unregister = registerGamepadEvents();
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

    client.on('connect', ()=>{ 
      console.log('connected to ' + client.io.uri ,client);
      setSocket({connected : true, uri: client.io.uri, io : client}) 
      events.socket.connect.fire()
    })

    client.on('disconnect', ()=>{
      console.log('disconnected ' + client.io.uri);   
      setSocket({connected : false, io : client})
      events.socket.disconnect.fire()
    })
    client.on('connect_error', err => {
      console.error('connect_error',err);
    })
    client.on('connect_failed', err => {
      console.error('connect_failed', err);
    })
    client.on('video', (data)=>{ 
      events.socket.cameraData.fire(data)
    })
    client.on('status', (data)=>{ 
      events.socket.deviceStatus.fire(data)
    })
  }

  useEffect(()=>{  
    console.log('started');
    connectSocket(localStorage.getItem('host') || 'localhost', localStorage.getItem('port') || '5123'); 

    return ()=>{ 
      disconnectSocket();
      events.socket.disconnect.fire()
    }
  }, [])


  return ( 
    <SocketContext.Provider value={socket}>
      <div className="App" >
        <ControlRobot />
        <CameraPreview>
          <Navbar connectSocket={(host, port) => connectSocket(host, port)} />
        </CameraPreview>
      </div>
    </SocketContext.Provider> 
  );
}

export default App;
