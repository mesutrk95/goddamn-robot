const Gpio = require('pigpio').Gpio;

class Motor {
    constructor(in1, in2){ 
        this.in1 = new Gpio(in1, {mode: Gpio.OUTPUT});
        this.in2 = new Gpio(in2, {mode: Gpio.OUTPUT}); 
        this.in1.digitalWrite(0);
        this.in2.digitalWrite(0);  
    }
    turn(dir, speed){
        const power = Math.floor(speed * 255)
        try {
            if(dir == 'f'){ 
                this.in1.digitalWrite(0);
                this.in2.pwmWrite(power);  
            } else { 
                this.in1.pwmWrite(power);
                this.in2.digitalWrite(0); 
            }
        } catch (error) {
            // console.error(dir, speed, power);
            throw {dir , speed, power}
        }
    }
    stop(){
        this.reset()
    }

    reset(){
        this.in1.digitalWrite(0);
        this.in2.digitalWrite(0);  
    }
}

class Motors {
    constructor(in1, in2, in3 ,in4){ 
        this.left = new Motor(in1, in2)
        this.right = new Motor(in3, in4)
    } 
    reset(){
        this.left.reset();
        this.right.reset();  
    }
}

module.exports = Motors;