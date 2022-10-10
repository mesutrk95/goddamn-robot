 
import base64
from PIL import Image
import eventlet
import socketio
import zlib 

from picamera import PiCamera
from time import sleep
from io import BytesIO
# import numpy as np

# eventlet.monkey_patch()
 

stream = BytesIO()

camera = PiCamera()
camera.start_preview()
camera.framerate = 30 
camera.resolution = (320, 240)  
 
sio = socketio.Server(cors_allowed_origins='*',logger=False)
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
}) 
  
@sio.event
async def connect(sid, environ, auth ):
    print('connect', sid, 'auth=' +  auth)

@sio.event
def action(sid, data):
    print(sid, 'message', data)

@sio.event
def video(sid, data):
    print(sid, 'message', data)  
    while True:
        print('camera get')
        camera.capture(stream, format='jpeg') 
        sio.emit('video', {'data': stream.getvalue()})
        stream.seek(0)  
        sleep(1/50)
        sio.sleep(0) 


@sio.event
def disconnect(sid):
    print('disconnect', sid)

if __name__ == '__main__':
 
    # app.listen('', 5123)
    eventlet.wsgi.server(eventlet.listen(('', 5123)), app)
    camera.stop_preview()
 
     


