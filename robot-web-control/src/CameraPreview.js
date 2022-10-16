import React, { useEffect, useState } from 'react'
import styles from './CameraPreview.module.scss'
import useSocket from './context/useSocket';

let frames = 0, totalSize =0,  startTime = Date.now();

export default function CameraPreview() {

    const socket = useSocket(0);
    const [fps, setFPS] = useState(0);
    const [speedRate, setSpeedRate] = useState(0);
    const [image, setImage] = useState(null);   

    useEffect(() => {
        // reconnect(); 
     
        let cancelHandler = setInterval(() => {
          const now = Date.now()
          const dur = (now - startTime)
          const fps = 1000 * frames / dur
          setSpeedRate((totalSize / dur).toFixed(1))
          setFPS(fps.toFixed(1))
          startTime = now;
          frames = 0;
          totalSize = 0;  
        }, 1000);

        window.events.socket.cameraData.register((data)=>{
            // var bytes = new Uint8Array(data.data);
            var blob = new Blob([data]);
            var reader = new FileReader();
            reader.onload = function(e) { 
                // imageRef.current.src = e.target.result;
                setImage(e.target.result)
            };
            reader.readAsDataURL(blob);
            frames++;
            totalSize += data.byteLength
            // let buff = Buffer.from(data)
            // console.log( buff.toString('base64'));
            // // setImage(data.toString('base64'))
        })
    
        return ()=>{ 
          console.log('clear interval');
          clearInterval(cancelHandler)
        }
      }, [])

    //   const imageObj = useSelector((state) => state.imageHandling.imageObj);

      const [width, setWidth] = useState(0);
      const [height, setHeight] = useState(0);
  
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
  
    //   useEffect(handleImageSize, [imageObj]);

    // useEffect(()=>{
    //     let connectSub = window.events.socket.connect.register(()=>{ 
    //     }) 
    //     let disconnectSub = window.events.socket.disconnect.register(()=>{ 
    //     }) 
    //     return ()=>{
    //         connectSub.unregister();
    //         disconnectSub.unregister();
    //     }
    // })
  return (
    <div className={styles.camera}> 
        <img src={image}  width={width} height={height}
            alt="rpi camera" style={{ transform : 'rotate(180deg)' }}/>
        {/* <img src={image} width={'100%'} height={'100%'} 
            alt="rpi camera" style={{ transform : 'rotate(180deg)', filter:'blur(50px)' }}/> */}

      {/* <div className={styles.image} style={{ backgroundImage: 'url(' + image + ')'}}/> */}

      <div className={styles.overlay}>
        <h6 className='mb-0 '>{fps} FPS</h6>
        <h6 className='mb-0'>{speedRate} Kbps</h6>
      </div>
    </div>
  )
}
