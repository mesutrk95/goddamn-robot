import { ArrowSwitchIcon, CpuIcon, DeviceCameraVideoIcon, FlameIcon, MeterIcon } from '@primer/octicons-react';
import React, { useEffect, useState } from 'react'
import { events } from '../context/app-events';
import styles from './CameraPreview.module.scss'
import useSocket from '../context/useSocket';

let frames = 0, totalSize =0,  startTime = Date.now();

export default function CameraPreview(props) {

    const socket = useSocket();
    const [fps, setFPS] = useState(0);
    const [speedRate, setSpeedRate] = useState(0);
    const [image, setImage] = useState(null);   
    const [deviceStatus, setDeviceStatus] = useState({ temp: 0, cpuUsage : 0});   
    
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // Update traffic rate & fps & camera image
    useEffect(() => { 
      let updateStatsIntervalHandler = setInterval(() => {
        const now = Date.now()
        const dur = (now - startTime)
        const fps = 1000 * frames / dur
        setSpeedRate((totalSize / dur).toFixed(1))
        setFPS(fps.toFixed(1))
        startTime = now;
        frames = 0;
        totalSize = 0;  
      }, 1000);

      let cameraDataSub = events.socket.cameraData.register((data)=>{ 
          var blob = new Blob([data]);
          var reader = new FileReader();
          reader.onload = function(e) {  
              setImage(e.target.result)
          };
          reader.readAsDataURL(blob);
          frames++;
          totalSize += data.byteLength 
      })
  
      return ()=>{  
        clearInterval(updateStatsIntervalHandler)
        cameraDataSub.unregister();
      }
  }, []) 

  
  const handleImageSize = () => { 
    const iw = 640, ih =  480;
    let w = 0;
    let h = 0;
    const ratio = iw / ih;

    const theSameTypes = () => {
        w = window.innerWidth;
        h = window.innerWidth / ratio;
        if (h > window.innerHeight) {
            h = window.innerHeight;
            w = h * ratio;
        }
    };

    if (iw > ih) {
        if (window.innerWidth > window.innerHeight) {
            theSameTypes(); //album picture and album screen
        } else {
            w = window.innerWidth; //album picture and portrait screen
            h = w / ratio;
        }
    } else {
        if (window.innerWidth > window.innerHeight) {
            h = window.innerHeight; // portrait picture and album screen
            w = h * ratio;
        } else {
            theSameTypes(); // portrait picture and portrait screen
        }
    }
    setWidth(w);
    setHeight(h); 
  };
  
  useEffect(() => {
    window.addEventListener("resize", handleImageSize);
    handleImageSize();
    return () => {
        window.removeEventListener("resize", handleImageSize);
    };
  }, []); 

  // update temp, auto video request
  useEffect(()=>{
    let connectSub = events.socket.connect.register(()=>{ 
      socket.io.emit('video', {})
    }) 
    let disconnectSub = events.socket.disconnect.register(()=>{ 
    }) 
    let deviceStatusSub = events.socket.deviceStatus.register((data)=>{ 
      setDeviceStatus(data);
    }) 
    
    return ()=>{
        connectSub.unregister();
        disconnectSub.unregister();
        deviceStatusSub.unregister();
    }
  }, [socket])

  return (
    <div className={styles.camera}> 
      <div className={styles.preview} style={{ width : width + 'px', height: height + 'px'}}>
        <img src={image}  width={'100%'} height={'100%'} alt=""  />
          
        <div className={styles.overlay}>
          <span className='d-flex align-items-center '><ArrowSwitchIcon className='ps-1 me-2' />
            {speedRate} KB/S
          </span>
          <span className='d-flex align-items-center '><DeviceCameraVideoIcon className='ps-1 me-2'/>
            {fps} FPS
          </span>
        </div>

        <div className={`${styles.overlay} ${styles.leftBottom}`}>
          <span className='d-flex align-items-center '>
            <FlameIcon className='ps-1 me-2' />Temp {Math.floor(deviceStatus.temp)}&deg;
          </span>
          <span className='d-flex align-items-center '>
            <MeterIcon className='ps-1 me-2' />CPU {Math.floor(deviceStatus.cpuUsage * 100)}%
          </span>
        </div> 
        
        {props.children}
      </div>  
    </div>
  )
}
