import socketio from "socket.io-client"; 
import React from "react"; 

export const socket = socketio.connect('localhost:5123');
export const SocketContext = React.createContext();