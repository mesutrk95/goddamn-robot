
const { StreamCamera, Codec, Flip, SensorMode } = 
    require('pi-camera-connect');


const qualities = {
    hq: {
        width: 320,
        height: 240,
        bitRate: 10 * 1000000,
        fps: 30
    },
    mq: {
        width: 320,
        height: 240,
        bitRate: 4 * 1000000,
        fps: 30
    },
    lq: {
        width: 320,
        height: 240,
        bitRate: 2 * 1000000,
        fps: 30
    }
} 


class Camera{
    state = 'none'
    quality = 'lq'
    streamCamera = null
    callback = null

    constructor(){
        
    }

    async start(){
        if(this.state === 'none'){
            this.state = 'streaming'; 
            this.streamCamera = this._createCamera(this.quality)
            this.streamCamera.on('frame', (data) => {
                this.callback(data) 
            });

            await this.streamCamera.startCapture()

        }
    }

    async stop(){
        if(this.state === 'streaming'){
            await this.streamCamera.stopCapture()
            this.streamCamera = null
        } 
        this.state = 'none'; 
    }

    async setQuality(q){ 
        this.quality = q;

        if(this.state === 'streaming'){
            await this.stop(); 
            await this.start();  
        } 
    }

    isStreaming(){
        return this.state === 'streaming';
    }

    onFrame(callback){ 
        this.callback = callback;
    }

    _createCamera(quality){
        return new StreamCamera({
            codec: Codec.MJPEG,
            flip: Flip.None,
            sensorMode: SensorMode.AutoSelect, 
            ...qualities[quality] 
            // sensorMode: SensorMode.Mode6
        });

    }
}

module.exports = Camera;