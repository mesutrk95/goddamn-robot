import { useContext, useEffect } from "react";
import GamepadContext from "./gamepad-context";

export default function useSocket() {
    let socket = useContext(GamepadContext)
    return socket;
 
}