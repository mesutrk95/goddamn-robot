 
import socketio from "socket.io-client";    
import useSocket from './context/useSocket';
import SocketContext from './context/socket-context';
  

import ControlRobot from './ControlRobot'; 
import { useEffect, useRef, useState } from 'react';

import Navbar from './Navbar';
import styles from './App.module.scss';
import CameraPreview from "./CameraPreview";



class EventDispatcher {
  callbacks = [] 
  fire(data){
    this.callbacks.forEach(c => c(data));  
  }
  register(callback) {
    this.callbacks.push(callback)
    return { unregister : () => this.callbacks.splice(this.callbacks.indexOf(callback) , 1) }
  }  
}
 
window.events = { 
  socket : { 
    disconnect : new EventDispatcher(),
    connect : new EventDispatcher(),
    reconnect : new EventDispatcher(), 
    cameraData : new EventDispatcher()
  }
}

// let socket = socketio.connect('localhost:5123');

function App() {   
  const [socket, setSocket] = useState(null);  

  
  function disconnectSocket(){
    if(socket){
      socket.disconnect() 
      console.log('disconnected from ' + window.socket.io.uri); 
    } 
  }

  function connectSocket(host, port){ 
    disconnectSocket()

    const client = socketio.connect(host + ':' + port); 
    setSocket(client);

    client.on('connect', ()=>{
      console.log('connected to ' + client.io.uri); 
      window.events.socket.connect.fire()
    })
    client.on('disconnect', ()=>{
      console.log('disconnected from ' + client.io.uri); 
      window.events.socket.disconnect.fire()
    })
    client.on('video', (data)=>{ 
      window.events.socket.cameraData.fire(data)
    })
  }
  useEffect(()=>{ 
    connectSocket(localStorage.getItem('host') || 'localhost', localStorage.getItem('port') || '5123'); 

    return ()=>{ 
      disconnectSocket();
      window.events.socket.disconnect.fire()
    }
  }, [])


  return (
    <SocketContext.Provider value={socket}>
      <div className="App" >
        <Navbar connectSocket={(host, port) => connectSocket(host, port)}/>
 
        <CameraPreview />
      </div>
    </SocketContext.Provider>
  );
}

export default App;
