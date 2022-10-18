const Gpio = require('pigpio').Gpio;
const Camera = require('./Camera') 
const Motors = require('./Motors') 

const motors = new Motors(19, 26, 16, 20) 
 
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
      motors.reset(); 
      console.log('reset');
    }
    let last = 0;

    client.on('action', async data => { 
      let now = Date.now();
      console.log('action', now - last, data); 
      last = now;

      const powerX = Math.floor(255 * data.x)
      const powerY = Math.floor(255 * data.y)
      motors.left.turn(powerY > 0 ? 'forward' : 'backward', powerY)
      motors.right.turn(powerY > 0 ? 'forward' : 'backward', powerY)


      if(timeoutHandle){ 
        clearTimeout(timeoutHandle)
      } 
      timeoutHandle = setTimeout(() => reset(), 75)

      return;
      if (data.y == 0 && data.x == 0){
        motors.reset(); 
      } else if(Math.abs(data.y) > 0 && Math.abs(data.x) > 0){
        const powerX = Math.floor(255 * data.x)
        const powerY = Math.floor(255 * data.y)
        if(powerX > 0){
          if(powerY > 0){
            in1.pwmWrite(power);
            in2.pwmWrite(0);
            in3.pwmWrite(power);
            in4.pwmWrite(0);   
          }else{

          }
        }else{
          if(powerY > 0){

          }else{
            
          }

        }


      } else if(Math.abs(data.y) > 0 && data.x == 0){ 
        const power = Math.abs(Math.floor(255 * data.y)) 
        if(data.y > 0){
          in1.pwmWrite(0);
          in2.pwmWrite(power);
          in3.pwmWrite(power);
          in4.pwmWrite(0);      
        }else{
          in1.pwmWrite(power);
          in2.pwmWrite(0);
          in3.pwmWrite(0);
          in4.pwmWrite(power);    
        }  
      } else if(Math.abs(data.x) > 0 && data.y == 0){ 
        const power = Math.abs(Math.floor(255 * data.x)) 
        if(data.x > 0){  
          in1.pwmWrite(power);
          in2.pwmWrite(0);
          in3.pwmWrite(power);
          in4.pwmWrite(0);    
        }else{
          in1.pwmWrite(0);
          in2.pwmWrite(power);
          in3.pwmWrite(0);
          in4.pwmWrite(power);        
        }  
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
  motors.reset();  
  await camera.stop();
  console.log('closed.');
  process.exit()
});