const PORT = process.env.PORT || 5123;

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const os 	= require('os-utils');

// const temp = require("pi-temperature");
const Gpio = require('pigpio').Gpio;
const Camera = require('./Camera') 
const Motors = require('./Motors') 
const motors = new Motors(20, 16, 19, 26) 

var app = express();
// app.use(cors());
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (req, res)=>{
  res.send('ok')
})
var server = app.listen(PORT, ()=>{
  console.log('listening on ' + PORT)
}); 
  
const io = require('socket.io')(server, { 
  cors : { 
    origin : '*'  
  }
}); 

  
let cameraRequesterClient = null; 
 
const camera = new Camera('lq') 
camera.onFrame( data  => {
  cameraRequesterClient.emit('video', data); 
});
 
function axis2deg(axis){
  const radianAngle = Math.atan2(axis.y, axis.x);  
  let degrees = radianAngle * (180 / Math.PI);   
  if (axis.y < 0) { 
    degrees = 360 + degrees;
  }  
  return degrees
}


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
      const axis = { x: parseFloat(data.x), y: parseFloat(data.y)}
  
      let deg = axis2deg(axis)
      let power = Math.sqrt(axis.x * axis.x + axis.y * axis.y)
      let df = deg < 180 ? 'f' : 'b'; 
      let db = deg < 180 ? 'b' : 'f';

      let now = Date.now();
      console.log('action', now - last, 
        'x:'+ axis.x.toFixed(4), 'y:'+ axis.y.toFixed(4), 
        "p:" + power, 'deg:' + deg); 
      last = now;  

      if(Math.abs(axis.x) < 0.01 && Math.abs(axis.y) < 0.01){
        motors.left.stop()
        motors.right.stop()
        return;
      }

      if(power > 0.9) power = 1
      if(deg > 180) deg = deg - 180 
       

      try{ 
        if(deg < 45){
          motors.right.turn(db, power * (1 - deg / 45))
          motors.left.turn(df, power)
        }
        else if(deg < 90){
          motors.right.turn(df, power * (-1 + deg / 45))
          motors.left.turn(df, power)
        }
        else if(deg < 135){
          motors.right.turn(df, power)
          motors.left.turn(df, power * (3 - deg / 45))
        }
        else if(deg < 180){
          motors.right.turn(df, power)
          motors.left.turn(db, power * (-3 + deg / 45))
        } 
        if(deg == 180){ 
          motors.right.turn(db, power )
          motors.left.turn(df, power)
        }
      }catch(ex){
        console.error(ex, deg + ' deg', power)
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

setInterval(() => {

  let p = os.cpuUsage(function(cpuUsage){ 
    var temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
    var temp_c = temp/1000;
    // console.log("It's " + temp_c + " celsius.");
    io.emit('status', {temp :temp_c, cpuUsage : cpuUsage}) 
    
  });
   
}, 2000);

process.on('SIGINT', async function () {
  motors.reset();  
  await camera.stop();
  console.log('closed.');
  process.exit()
});