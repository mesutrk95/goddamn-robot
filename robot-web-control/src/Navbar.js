import { useState } from 'react';
import useSocket from './context/useSocket';
import styles from './Navbar.module.scss'

export default function Navbar(props) {
 
    const socket = useSocket();
    const [host, setHost] = useState(localStorage.getItem('host') || 'localhost'); 
    const [port, setPort] = useState(localStorage.getItem('port') || '5123');

    function handleQualityChange(event) { 
        socket.emit('video-quality', event.target.value)
    }

    return (
        <div className=' '>
            <nav className={styles.navbar}>
                {props.children}
                <div className=' '>
                    <div className='  px-0 d-flex align-items-center'>
                        <input className={styles.host} type="text" value={host} 
                                onChange={ e => {setHost(e.target.value); localStorage.setItem('host',e.target.value) } } 
                                placeholder="host" />
                        <input className={styles.port}  type="number" value={port} 
                                onChange={ e => {setPort(e.target.value); localStorage.setItem('port', e.target.value)} } 
                                placeholder="port" />

                        <div className='btn btn-outline-primary' onClick={e => props.connectSocket(host, port) }>Connect</div>

                        <div className='btn btn-warning' onClick={e => socket.emit('video', { }) }>get image</div>
                        
                        <select onChange={handleQualityChange}>
                            <option value="lq">Low Quality</option>
                            <option value="mq">Medium Quality</option>
                            <option value="hq">High Quality</option>
                        </select>
                    </div>
                    <div className='  px-0 text-white'>
                    {
                        socket && (
                        <>
                            <h6 className="mb-0">Server Host = {socket.io.uri}</h6>
                            <h6 className="mb-0">Socket Status = {socket.connected ? 'Connected': 'Not Connected'} </h6>  
                        </>
                        )
                    }
                    </div>
                </div> 
            </nav>
        </div>
    )
}
