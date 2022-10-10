const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
  
const { StreamCamera, Codec, Flip, SensorMode } = require('pi-camera-connect');

let cameraRequesterClient = null;
const streamCamera = new StreamCamera({
  codec: Codec.MJPEG,
  flip: Flip.None,
  sensorMode: SensorMode.AutoSelect,
  width: 320,
  height: 240,
  bitRate: 1 * 1000000,
  fps: 30

  // sensorMode: SensorMode.Mode6
});
streamCamera.on('frame', (data) => {
  cameraRequesterClient.emit('video',data);
  //  "data:image/jpeg;base64," + data.toString("base64"));
});
let captureStarted = false;

io.on('connection', client => {
    console.log('connection ' , client.id);
    client.on('action', async data => { 
      console.log('action', data);
    })
    
    client.on('video', async data => { 
        if(!captureStarted){
          captureStarted= true;
          cameraRequesterClient = client
          await streamCamera.startCapture();
          console.log('capture started')
        }else{
          await streamCamera.stopCapture();
          cameraRequesterClient = null
          captureStarted= false;
          console.log('capture stopped')
        }
          
        // client.emit('video', res)

    });
    client.on('disconnect', async () => { 
      console.log(client.id, 'disconnected')
      
      if(captureStarted && cameraRequesterClient && 
        cameraRequesterClient.id == client.id){  
        await streamCamera.stopCapture();
        captureStarted= false;
        console.log('capture stopped')
      }

    });
});
server.listen(5123, ()=>{
  console.log('listening on ' + 5123)
});

process.on('SIGINT', async function () {
  if(captureStarted){
    console.log('stopping camera...');
    await streamCamera.stopCapture();
  }
  console.log('closed.');
  process.exit()
});