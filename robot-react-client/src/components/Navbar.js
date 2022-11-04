import { EyeClosedIcon, ZapIcon } from '@primer/octicons-react';
import { useState } from 'react';
import CheckButton from './CheckButton'; 
import useSocket from '../context/useSocket'; 
import MenuButton from './MenuButton';
import styles from './Navbar.module.scss'
import RadioButton from './RadioButton';


export default function Navbar(props) {
 
    // const gp = useGamepad();
    const socket = useSocket();
    const [host, setHost] = useState(localStorage.getItem('host') || 'localhost'); 
    const [port, setPort] = useState(localStorage.getItem('port') || '5123');
    const [quality, setQuality] = useState(localStorage.getItem('videoQuality') || 'hq');
    const [autoPreview, setAutoPreview] = useState(localStorage.getItem('autoPreview') === '1');

    const [menuOpen, setMenuOpen] = useState({ conn: false, preview: false}); 

    function handleQualityChange(q) { 
        localStorage.setItem('videoQuality', q)
        setQuality(q)
        socket.io.emit('video-quality', q)
    } 

    function handleAutoPreview(value){
        localStorage.setItem('autoPreview', value ? '1': '0')
        setAutoPreview(value);
    }

    function stopCamera(){

    }

    function openMenu(name){
        const newMenu = {}
        for (const mn in menuOpen) newMenu.mn = false 
        if(!menuOpen[name]) newMenu[name] = true; 
        setMenuOpen(newMenu) 
    }

    return (
        <div className=' '>
            <div className={styles.topbar}>
                <div className={styles.buttons}>
                    <MenuButton icon="BroadcastIcon" isOpen={menuOpen.conn} 
                            onHandleClick={e => openMenu('conn')}  
                            type={socket.connected ? 'success': ''}>
                        <div className={styles.info}>
                            <h6 className='mb-1'>Connectivity Status</h6>
                            <div className='ps-0'> 
                                {
                                    socket.connected && <>
                                        <div className={`${styles.row}`}>
                                            <span className='t-muted'>State: </span> 
                                            <span className='fw-bold t-success'>Connected </span>
                                        </div> 
                                        <div className={`${styles.row}`}>
                                            <span className='t-muted'>Robot URI: </span> 
                                            <span className='fw-bold'>
                                                {socket.uri.replace('http://', '')}
                                            </span>
                                        </div> 
                                    </>
                                } 
                                {
                                    !socket.connected && 
                                    <>
                                        <div className={`${styles.row}`}>
                                            <span>Connection Status: </span> 
                                            <span className='fw-bold'>
                                                <span className='t-warning'>Not Connected</span>  
                                            </span>
                                        </div>  
                                    </> 
                                }
                            </div>
                        </div>
                        <hr className='my-1'/>
                        <h6 className='mb-1'>Connection Setup</h6>
                        <p className='t-muted mb-0'>
                            The robot default connection port is 80 or 5123
                        </p>
                        <div className='d-flex'>
                            <div className='col me-2'>
                                <label>Host</label>
                                <input type="text" className={`${styles.host} `} value={host} 
                                    onChange={ e => {setHost(e.target.value); localStorage.setItem('host',e.target.value) } } 
                                    placeholder="Robot Hostname" />
                            </div>
                            <div className='col-auto'>
                                <label>Port</label><br/>
                                <input type="text" className={`${styles.port} `} value={port} 
                                    onChange={ e => {setPort(e.target.value); localStorage.setItem('port', e.target.value)} } 
                                    placeholder="Robot Port" />
                            </div>
                        </div>
                        <div className='d-flex mt-2'>
                            <div className={`${styles.btn} ${styles.btnSuccess}  w-100`} onClick={e => props.connectSocket(host, port) }>
                                <ZapIcon className='ps-1' size='small'></ZapIcon>
                                <span className='ps-1'>Reconnect</span>
                            </div>
                        </div>


                    </MenuButton> 
                    <MenuButton className="ms-2" icon="DeviceCameraVideoIcon" isOpen={menuOpen.preview} 
                            onHandleClick={e => openMenu('preview')}   >
                        <h6 className='mb-0'>Camera Video Quality</h6>
                        <p className='t-muted mb-2'>The 1080x720-30 FPS is reachable in the high quality option.</p>
                        <RadioButton value="vhq" checked={quality} label="Ultra HD Quality" onChange={value => handleQualityChange(value)}/>
                        <RadioButton value="hq" checked={quality} label="HD Quality" onChange={value => handleQualityChange(value)}/>
                        <RadioButton value="mq" checked={quality} label="Medium Quality" onChange={value => handleQualityChange(value)}/>
                        <RadioButton value="lq" checked={quality} label="VGA Quality" onChange={value => handleQualityChange(value)}/> 
                        <RadioButton value="vlq" checked={quality} label="QVGA Quality" onChange={value => handleQualityChange(value)}/> 
                        
                        <div className='py-2'></div>

                        <h6 className='mb-0'>Auto Camera Preview</h6>
                        <p className='t-muted mb-2'>Get camera image immediately after connection established.</p>
                        <CheckButton checked={props.quality} label="Auto Preview"
                                    value={autoPreview}
                                    onChange={ value => handleAutoPreview(value)}/> 
                                    
                        <div className='d-flex mt-3'>
                            <div className={`${styles.btn} ${styles.btnDanger} w-100`} onClick={e => stopCamera() }>
                                <EyeClosedIcon className='ps-1' size='small'/>
                                <span className='ps-1'>Stop Camera Stream</span>
                            </div>
                        </div>
                    </MenuButton>
                </div>
            </div>
            {/* <nav className={`${styles.navbar} d-none`} >
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
            </nav> */}
        </div>
    )
}
