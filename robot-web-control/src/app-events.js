
class EventDispatcher {
    callbacks = [] 
    fire(data){
      this.callbacks.forEach(c => c(data));  
    }
    register(callback) {
      this.callbacks.push(callback)
      return { unregister : () => this.callbacks.splice(this.callbacks.indexOf(callback) , 1) }
    }  
  }
   
const events = { 
    socket : { 
        disconnect : new EventDispatcher(),
        connect : new EventDispatcher(),
        reconnect : new EventDispatcher(), 
        cameraData : new EventDispatcher()
    },
    gamepad:{
      connect: new EventDispatcher(),
      disconnect: new EventDispatcher(),
      update: new EventDispatcher()
    }
}
 
export {events};