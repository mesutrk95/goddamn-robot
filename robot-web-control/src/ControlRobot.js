import styles from './ControlRobot.module.scss'
import React, { useContext, useEffect } from 'react'
// import {SocketContext} from './context/socket';

let keysDown = '';
let cmdSendIntervalHandler = null
function sendCMD(){ 
    console.log('action', keysDown)
    window.socket.emit('action', keysDown)
}

export default function ControlRobot() {
    // const socket = window.socket;//useContext(SocketContext); 

    useEffect(() => { 
        
        function keyDown(e){
            console.log('key-down');
            if(e.key === 'w' || e.key === 'ArrowUp')  keysDown = 'move-forward' 
            else if(e.key === 's' || e.key === 'ArrowDown')  keysDown = 'move-backward'
            else if(e.key === 'd' || e.key === 'ArrowRight')  keysDown = 'turn-right'
            else if(e.key === 'a' || e.key === 'ArrowLeft')  keysDown = 'turn-left'
            // else if(e.key === 'x')  action('stop')  

            if(!cmdSendIntervalHandler) {
                clearInterval(cmdSendIntervalHandler) 
                // sendCMD();
                cmdSendIntervalHandler = setInterval(sendCMD , 50)
            }
        }

        function keyUp(e){
            console.log('key-up' ); 
            clearInterval(cmdSendIntervalHandler)
            cmdSendIntervalHandler = null;
        }

        window.addEventListener("keydown", keyDown);  
        window.addEventListener("keyup", keyUp);  

        let socketDisconnectUnregister = window.events.socket.disconnect.register(()=>{
            clearInterval(cmdSendIntervalHandler)
            cmdSendIntervalHandler = null;
        })

        return ()=>{
            window.removeEventListener("keydown", keyDown); 
            window.removeEventListener("keyup", keyUp); 
            clearInterval(cmdSendIntervalHandler)
            socketDisconnectUnregister();
        }
    }, [])

    function action(name){

        window.socket.emit('action', name)

    }

    function buttonDown(btn){

    }

    return (
        <div className={styles.controls}>
            <div className={`${styles.box} py-5`}>
                <div className="row mb-3">
                    <div className="col"> 
                    </div>
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onMouseDown={e => action('move-forward')} >Forward</div> 
                    </div>
                    <div className="col"> 
                    </div> 
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onMouseDown={e => action('turn-left')}>Left</div> 
                    </div>
                    <div className="col"> 
                        <div className={`${styles.btn} btn btn-danger`} onMouseDown={e => action('stop')}>Stop</div> 
                    </div>
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onMouseDown={e => action('turn-right')}>Right</div> 
                    </div> 
                </div>
                <div className="row mb-3">
                    <div className="col"> 
                    </div>
                    <div className="col"> 
                        <div className={`${styles.btn} btn btn-primary`} onClick={e => action('move-backward')}>Backward</div> 
                    </div>
                    <div className="col"> 
                    </div> 
                </div>
            </div>
        </div>
    )
}
