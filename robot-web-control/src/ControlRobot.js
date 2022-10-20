import styles from './ControlRobot.module.scss'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import useSocket from './context/useSocket';
import useGamepad from './context/useGamepad';
import { events } from './app-events';
// import {SocketContext} from './context/socket'; 

import KeyboardEventHandler from '@infinium/react-keyboard-event-handler';
 
let cmdSendIntervalHandler = null 

let axis = {x : 0, y : 0}

function sqrt(value){
    return value < 0 ? -Math.sqrt(-value): Math.sqrt(value)
}

export default function ControlRobot() { 

    const socket = useSocket();  
 
    const sendCMD = useCallback(caxis => { 
        const axx = caxis || axis
        let a = { x: axx.x.toFixed(4) , y: axx.y.toFixed(4) };
        console.log('axis', a) 
        socket.emit('action', a)
    }, [socket]);

    function onKeyDown(key ,event) {
        console.log('key-down', key, axis); 
        
        if(key === 'w' || key === 'ArrowUp')  axis.y = 1
        else if(key === 's' || key === 'ArrowDown')  axis.y = -1
        // else axis.y = 0

        if(key === 'd' || key === 'ArrowRight') axis.x = 1
        else if(key === 'a' || key === 'ArrowLeft') axis.x = -1
        // else axis.x = 0

        console.log('key-down then', key, axis); 

        if(!cmdSendIntervalHandler) { 
            clearInterval(cmdSendIntervalHandler) 
            cmdSendIntervalHandler = setInterval(()=> sendCMD(), 50)
            sendCMD();
        } 
    }
    function onKeyUp( key, event ) {
        console.log('key-up', key, axis); 
        if( key === 'w' || key === 'ArrowUp' || key === 's' || key === 'ArrowDown' ) axis.y = 0  
        if( key === 'd' || key === 'ArrowRight' || key === 'a' || key === 'ArrowLeft' ) axis.x = 0  

        if(axis.x === 0 && axis.y === 0){
            clearInterval(cmdSendIntervalHandler)
            cmdSendIntervalHandler = null;
            // axis = {x : 0, y : 0}
        }
    }
  
    useEffect(() => {  
        if(socket){
            socket.on('action' , (data)=> {
                console.log('deg:', data);
            })
        }
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
                sendCMD(a)
            }
        })
        return ()=>{ 
            sub.unregister()
        } 
    }, [socket, sendCMD])

    const [isMouseDown, setMouseIsDown] = useState(false); 
    const widgetHandleRef = useRef()
    const widgetRef = useRef()

    function onMouseDownHandle(e){ 
        setMouseIsDown(true)
        widgetHandleRef.current.style.left = '0px'
        widgetHandleRef.current.style.top = '0px'
    }
    function onMouseUpHandle(e){ 
        setMouseIsDown(false) 
        const rw = widgetRef.current.offsetWidth / 2  
        const rh = widgetHandleRef.current.offsetWidth / 2   
        widgetHandleRef.current.style.left = (rw - rh) + 'px'
        widgetHandleRef.current.style.top = (rw - rh) + 'px' 
        let newAxis = { x: 0 , y : 0 };
        axis = newAxis;

        // console.log(newAxis) 

        clearInterval(cmdSendIntervalHandler)
        cmdSendIntervalHandler = null;
        sendCMD();
    }
    function onMouseMoveHandle(e){
        if(!isMouseDown) return;
        const ox = widgetRef.current.offsetLeft
        const oy = widgetRef.current.offsetTop

        const rw = widgetRef.current.offsetWidth / 2  
        const rh = widgetHandleRef.current.offsetWidth / 2 

        let absX = (e.clientX - ox) 
        let absY = (e.clientY - oy)   
        const len =Math.sqrt(Math.pow(absX - rw, 2) + Math.pow(absY - rw, 2))
        // if(len <= 0.01){
            
        // }
        const x = absX - rw
        const y = -(absY - rw)
        const   normX = x / len,
                normY = y / len 

        if(len > rw){ 
            absX = normX * rw + rw
            absY = -normY * rw + rw
        } 
        widgetHandleRef.current.style.left = (absX - rh) + 'px'
        widgetHandleRef.current.style.top = (absY - rh) + 'px'

        const l = 2 * (absX / rw * 0.5 - 0.5)
        const t = -2 * (absY / rw * 0.5 - 0.5)
        const newAxis = { x: sqrt(l) , y : sqrt(t)};
        // console.log(l, t)
        axis = newAxis;

        if(!cmdSendIntervalHandler) { 
            clearInterval(cmdSendIntervalHandler) 
            cmdSendIntervalHandler = setInterval(()=> sendCMD(), 10)
            sendCMD();
        } 
    }

    return (
        <div className={styles.controls}>
            <KeyboardEventHandler
                handleEventType="keydown"
                handleKeys={['a', 'w', 's', 'd']}
                onKeyEvent={onKeyDown} />
                
            <KeyboardEventHandler
                handleEventType="keyup"
                handleKeys={['a', 'w', 's', 'd']}
                onKeyEvent={onKeyUp} />

            <div className={styles.moveWidget} ref={widgetRef} onMouseDown={e => onMouseDownHandle(e)} onMouseMove={e => onMouseMoveHandle(e)} onMouseUp={e => onMouseUpHandle(e)}>
                <div className={styles.handle} ref={widgetHandleRef}>

                </div>
            </div> 
        </div>
    )
}
