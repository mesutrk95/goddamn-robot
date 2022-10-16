const Gpio = require('pigpio').Gpio;

const in1 = new Gpio(19, {mode: Gpio.OUTPUT});
const in2 = new Gpio(26, {mode: Gpio.OUTPUT});
const in3 = new Gpio(16, {mode: Gpio.OUTPUT});
const in4 = new Gpio(20, {mode: Gpio.OUTPUT}); 
 
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

    let timeoutHandle = null;
    function reset(){
      timeoutHandle = null;
      in1.digitalWrite(0);
      in2.digitalWrite(0);
      in3.digitalWrite(0);
      in4.digitalWrite(0);  
      console.log('reset');
    }
    let last = 0;

    client.on('action', async data => { 
      let now = Date.now();
      console.log('action', now - last, data); 
      last = now;


      if(data == 'move-forward'){ 
        in1.digitalWrite(1);
        in2.digitalWrite(0);
        in3.digitalWrite(0);
        in4.digitalWrite(1);  
      }
      if(data == 'move-backward'){
        in1.digitalWrite(0);
        in2.digitalWrite(1);
        in3.digitalWrite(1);
        in4.digitalWrite(0); 
      }
      if(data == 'turn-left'){
        in1.digitalWrite(0);
        in2.digitalWrite(1);
        in3.digitalWrite(0);
        in4.digitalWrite(1);  
      }
      if(data == 'turn-right'){
        in1.digitalWrite(1);
        in2.digitalWrite(0);
        in3.digitalWrite(1);
        in4.digitalWrite(0);  
      }
      if(timeoutHandle){ 
        clearTimeout(timeoutHandle)
      } 
      timeoutHandle = setTimeout(() => reset(), 75)
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
  in1.digitalWrite(0);
  in2.digitalWrite(0);
  in3.digitalWrite(0);
  in4.digitalWrite(0);

  await camera.stop();
  console.log('closed.');
  process.exit()
});