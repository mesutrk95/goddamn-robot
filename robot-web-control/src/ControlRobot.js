import styles from './ControlRobot.module.scss'
import React, { useContext, useEffect } from 'react'
import {SocketContext} from './context/socket';

export default function ControlRobot() {
    const socket = useContext(SocketContext); 

    useEffect(() => { 
        function keyDown(e){
            console.log(e);
            if(e.key === 'w' || e.key === 'ArrowUp')  action('move-forward') 
            else if(e.key === 's' || e.key === 'ArrowDown')  action('move-backward') 
            else if(e.key === 'd' || e.key === 'ArrowRight')  action('turn-right') 
            else if(e.key === 'a' || e.key === 'ArrowLeft')  action('turn-left') 
            else if(e.key === 'x')  action('stop') 
        }
        window.addEventListener("keydown", keyDown);  
        return ()=>{
            window.removeEventListener("keydown", keyDown); 
        }
    }, [])

    function action(name){
        socket.emit('action', name)

    }

    return (
        <div className={styles.controls}>
            <div className={`${styles.box} py-5`}>
                <div className="row mb-3">
                    <div className="col"> 
                    </div>
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onClick={e => action('move-forward')}>Forward</div> 
                    </div>
                    <div className="col"> 
                    </div> 
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onClick={e => action('turn-left')}>Left</div> 
                    </div>
                    <div className="col"> 
                        <div className={`${styles.btn} btn btn-danger`} onClick={e => action('stop')}>Stop</div> 
                    </div>
                    <div className="col">
                        <div className={`${styles.btn} btn btn-primary`} onClick={e => action('turn-right')}>Right</div> 
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
