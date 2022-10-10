import logo from './logo.svg';
import './App.scss'; 
 
// import {SocketContext, socket} from './context/socket'; 
import ControlRobot from './ControlRobot'; 
import { useEffect, useRef, useState } from 'react';

import socketio from "socket.io-client";    


let frames = 0, totalSize =0,  startTime = Date.now();

function App() { 
 
  const [fps, setFPS] = useState(0);
  const [speedRate, setSpeedRate] = useState(0);
  const [port, setPort] = useState(localStorage.getItem('port') || '5123');
  const [host, setHost] = useState(localStorage.getItem('host') || 'localhost');
  const [socket, setSocket] = useState(window.socket); 
  const [image, setImage] = useState(null); 
  const imageRef = useRef();

  function reconnect(){
    console.log('connection', host + ':' + port);
    if(window.socket){
      window.socket.disconnect() 
    }
    window.socket = socketio.connect(host + ':' + port, {
      // rejectUnauthorized: false,
      // auth: {
      //     'test': 'test'
      // }
    });

    window.socket.on('connect', ()=>{
      console.log('connected to ' + window.socket.io.uri);
      setSocket(window.socket)
    })
    window.socket.on('video', (data)=>{ 
      // var bytes = new Uint8Array(data.data);
      var blob = new Blob([data]);
      var reader = new FileReader();
      reader.onload = function(e) { 
          imageRef.current.src = e.target.result;
      };
      reader.readAsDataURL(blob);
      frames++;
      totalSize += data.byteLength
      // let buff = Buffer.from(data)
      // console.log( buff.toString('base64'));
      // // setImage(data.toString('base64'))

 
    })
  }

  useEffect(() => {
    reconnect();
    console.log(window.socket); 

    console.log('set interval');
    let cancelHandler = setInterval(() => {
      const now = Date.now()
      const dur = (now - startTime)
      const fps = 1000 * frames / dur
      setSpeedRate((totalSize / dur).toFixed(1))
      setFPS(fps.toFixed(1))
      startTime = now;
      frames = 0;
      totalSize = 0;
      console.log('calc'); 
      
    }, 1000);

    return ()=>{ 
      console.log('clear interval');
      clearInterval(cancelHandler)
    }
  }, [])

  return (
    // <SocketContext.Provider value={socket}>
      <div className="App" >
        {
          socket && (
            <>
              <h5 className="mb-0">Server Host = {socket.io.uri}</h5>
              <h5 className="mb-0">Socket Status = {socket.connected ? 'Connected': 'Not Connected'} </h5>  
            </>
          )
        }
        <input type="text" value={host} onChange={ e => {setHost(e.target.value); localStorage.setItem('host',e.target.value) } } placeholder="host" />
        <input type="number" value={port} onChange={ e => {setPort(e.target.value); localStorage.setItem('port', e.target.value)} } placeholder="port" />
        <div className='btn btn-outline-primary' onClick={e => reconnect() }>Connect</div>

        <div className='btn btn-warning' onClick={e => window.socket.emit('video', { }) }>get image</div>
        <div className='container'>

          <div className='row py-5'>
            <div className='col-lg-6'> 
              <ControlRobot />
            </div>
            <div className='col-lg-6'>  
              <img ref={imageRef} src={image} width={320} height={240} alt="rpi camera" style={{ transform : 'rotate(180deg)', borderRadius:'20px'}}/>
              <h6 className='mb-0 mt-2'>{fps} FPS</h6>
              <h6 className='mb-0'>{speedRate} Kbps</h6>
            </div>
          </div>
        </div>
 
      </div>
    // </SocketContext.Provider>
  );
}

export default App;
