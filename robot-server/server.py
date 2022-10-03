import eventlet
import socketio

sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})

@sio.event
def connect(sid, environ):
    print('connect', sid)

@sio.event
def action(sid, data):
    print(sid, 'message', data)

@sio.event
def disconnect(sid):
    print('disconnect', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5123)), app)