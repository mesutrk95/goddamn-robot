import logo from './logo.svg';
import './App.scss'; 
 
import {SocketContext, socket} from './context/socket'; 
import ControlRobot from './ControlRobot'; 
import { useEffect } from 'react';

function App() { 
 
  useEffect(() => {
    console.log(socket); 
}, [])

  return (
    <SocketContext.Provider value={socket}>
      <div className="App" >
        <h5 className="mb-0">Server Host = {socket.io.uri}</h5>
        <h5 className="mb-0">Socket Status = {socket.connected ? 'Connected': 'Not Connected'} </h5>  

        <ControlRobot />
      </div>
    </SocketContext.Provider>
  );
}

export default App;
