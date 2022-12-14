import styles from './ControlRobot.module.scss'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'

import useSocket from '../context/useSocket'; 
import { events } from '../context/app-events'; 
import { Joystick } from 'react-joystick-component';

import KeyboardEventHandler from '@infinium/react-keyboard-event-handler';
 
let cmdSendIntervalHandler = null  
let axis = {x : 0, y : 0} 

function sqrt(value){
    return value < 0 ? -Math.sqrt(-value): Math.sqrt(value)
}

export default function ControlRobot() { 

    const socket = useSocket();  
 
    const moveRobot = useCallback(caxis => { 
        const axx = caxis || axis
        let a = { x: axx.x.toFixed(4) , y: axx.y.toFixed(4) };
        console.log('axis', a) 
        socket.io.emit('action', a)
    }, [socket]);

    const turnCamera = useCallback(angle => {  
        console.log('camera-turn', angle) 
        socket.io.emit('camera-turn', angle)
    }, [socket]);

    function onKeyDown(key ,event) {
        console.log('key-down', key, axis); 
         
        if( key === 'down' || key === 'up'){
            turnCamera(key === 'down' ? 1 : -1);
        }else { 
            if(key === 'w' )  axis.y = 1
            else if(key === 's')  axis.y = -1
            // else axis.y = 0
    
            if(key === 'd') axis.x = 1
            else if(key === 'a' ) axis.x = -1
            // else axis.x = 0
    
            console.log('key-down then', key, axis); 
    
            if(!cmdSendIntervalHandler) { 
                clearInterval(cmdSendIntervalHandler) 
                cmdSendIntervalHandler = setInterval(()=> moveRobot(), 50)
                moveRobot();
            } 
        }

    }
    function onKeyUp( key, event ) {
        console.log('key-up', key, axis); 
        
        if( key === 'down' || key === 'up'){

        }

        if( key === 'w' || key === 's' ) axis.y = 0  
        if( key === 'd' || key === 'a' ) axis.x = 0  

        if(axis.x === 0 && axis.y === 0){
            clearInterval(cmdSendIntervalHandler)
            cmdSendIntervalHandler = null;
            // axis = {x : 0, y : 0}
        }
    }
  
    useEffect(() => {   
        let disconnectSub = events.socket.disconnect.register(()=>{
            clearInterval(cmdSendIntervalHandler)
            cmdSendIntervalHandler = null;
        })

        return ()=>{ 
            clearInterval(cmdSendIntervalHandler) 
            cmdSendIntervalHandler = null;
            disconnectSub.unregister(); 
        }
    }, [socket]) 

    useEffect(()=>{ 
        const sub = events.gamepad.update.register(gp =>{
            if(Math.abs(gp.axes[0]) > 0.01 || Math.abs(gp.axes[1]) > 0.01){
                console.log(gp.axes);
                const a = { x : gp.axes[0], y: -gp.axes[1] }
                moveRobot(a)
            }
            if(Math.abs(gp.axes[2]) > 0.01 || Math.abs(gp.axes[3]) > 0.01){
                console.log(gp.axes);
                const ct = { x : gp.axes[2], y: -gp.axes[3] } 
                turnCamera(ct.y > 0 ? 1 : -1);
            }
        })
        return ()=>{ 
            sub.unregister()
        } 
    }, [socket, moveRobot, turnCamera])
  
    function handleJoyStick(action, e){ 
        
        const newAxis = { x: sqrt(e.x / 35) , y : sqrt(e.y / 35)};
        console.log(action, e)
        axis = newAxis; 

        if(action === 'Stopped'){
            clearInterval(cmdSendIntervalHandler) 
            cmdSendIntervalHandler = null
        } else if(action === 'Started'){
            if(!cmdSendIntervalHandler) { 
                clearInterval(cmdSendIntervalHandler) 
                cmdSendIntervalHandler = setInterval(()=> moveRobot(), 10)
                moveRobot();
            } 
        }
    }

    return (
        <div className={styles.controls}>
            <KeyboardEventHandler
                handleEventType="keydown"
                handleKeys={['a', 'w', 's', 'd', 'left', 'right', 'up', 'down']}
                onKeyEvent={onKeyDown} />
                
            <KeyboardEventHandler
                handleEventType="keyup"
                handleKeys={['a', 'w', 's', 'd', 'left', 'right', 'up', 'down']}
                onKeyEvent={onKeyUp} />

            <div className={styles.joystick}>
                <Joystick   
                    start={e => handleJoyStick("Started", e)} 
                    move={e => handleJoyStick('Move', e)} 
                    stop={e =>handleJoyStick("Stopped", e)}
                    throttle={50} size={70}
                    stickColor="#00000055" baseColor="#00000000"
                />
            </div> 
        </div>
    )
}
