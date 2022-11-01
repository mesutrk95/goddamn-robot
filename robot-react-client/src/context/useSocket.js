import { useContext, useEffect } from "react";
import SocketContext from "./socket-context";

export default function useSocket() {
    let socket = useContext(SocketContext)
    return socket;
 
}