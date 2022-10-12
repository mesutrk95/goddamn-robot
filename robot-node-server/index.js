
const Camera = require('./Camera') 
const server = require('http').createServer();
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
  
let cameraRequesterClient = null; 

const camera = new Camera('lq') 
camera.onFrame( data  => {
  cameraRequesterClient.emit('video', data); 
});
 

io.on('connection', client => {
    console.log('connection ' , client.id);
    client.on('action', async data => { 
      console.log('action', data);
    })
    
    client.on('video', async data => { 

        if(!camera.isStreaming()){
          cameraRequesterClient = client;
          await camera.start()
          console.log('capture started')
        }else{
          await camera.stop()  
          console.log('capture stopped')
        }  
    });
    
    client.on('video-quality', async (data) =>{
        console.log('quality', data); 
 
        await camera.setQuality(data)
    })

    client.on('disconnect', async () => { 
      console.log(client.id, 'disconnected')
      
      if(camera.isStreaming() && cameraRequesterClient && 
        cameraRequesterClient.id == client.id){  
        await camera.stop(); 
        console.log('capture stopped')
      }

    });
});
server.listen(5123, ()=>{
  console.log('listening on ' + 5123)
});

process.on('SIGINT', async function () {
  await camera.stop();
  console.log('closed.');
  process.exit()
});