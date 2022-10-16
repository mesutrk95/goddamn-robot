 
import styles from './App.module.scss';

import socketio from "socket.io-client";     
import SocketContext from './context/socket-context';
  

import ControlRobot from './ControlRobot'; 
import { useEffect, useState } from 'react';

import Navbar from './Navbar';
import CameraPreview from "./CameraPreview";
import { events } from "./app-events";
  

function App() {   
  const [socket, setSocket] = useState(null);  

  
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
    connectSocket(localStorage.getItem('host') || 'localhost', localStorage.getItem('port') || '5123'); 

    return ()=>{ 
      disconnectSocket();
      events.socket.disconnect.fire()
    }
  }, [])


  return (
    <SocketContext.Provider value={socket}>
      <div className="App" >
        <Navbar connectSocket={(host, port) => connectSocket(host, port)}/>
 
        <ControlRobot />
        <CameraPreview />
      </div>
    </SocketContext.Provider>
  );
}

export default App;
