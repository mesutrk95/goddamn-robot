## :triangular_flag_on_post: **RaspberreyPI Remote Tank Chassis Robot** :triangular_flag_on_post:
This project contains all neccessary source codes to control a 
remote **Raspberry Pi** based tank chassis robot, *Dedicated to lovers of robotics & software developers!*

You can have your own tank chassis design depending on 
the hardwares you may have. *Click here to see [demo images & videos  :bulb:](/docs/demo.md) of what i have made.*

If you are looking for the hardware implementation then please 
follow [this link](/docs/hardware.md) or If you are intereseted 
to know more about the project software implementation then please stay here!  :orange:

![My Robot Design](/docs/github-overview.jpg)  

### :mag_right: Overview
I have used Wifi communication protocol to connect the robot to its controller,
Thus the robot and robot's controller should be 
connected to a **same Wifi network**, You can connect them to your home Wifi, Or you can setup the RPI to make an 
**access point**, That there is more [details](https://github.com/RaspberryConnect/AutoHotspot-Installer) 
about this kind of setup.

The RPI4 considered to be a **Server** and the web client application is 
our **Client**. The project consists of 2 separated projects for controlling the robot :
- [Robot Application (Server)](#robotrobot-application-server)  
- [Robot Webapp Controller (Client)](#joystick-robot-webapp-controller-client)    
 
### :mechanical_arm: Features
Many other interesting features can be added to the robot, And they can realy make 
the robot smarter! The robot is still under development. At the time of writing the 
documentation, These are the main features of robot: 

- Smooth movements in all directions
- Smooth turn control
- Camera live stream
- Robot keyboard controller 
- Robot mouse controller 
- Robot joystick controller 
 

### :robot:	Robot application (Server)
The robot Nodejs application
simply makes a SocketIO server that is listening to port 5123 
by default. The app has got access to the RPI GPIO and the RPI 
camera, then you must have setup your RPI config to enable camera.

[Read more](/robot-node-server/Readme.md) about the robot application script and installation guides.

### :joystick: Robot webapp controller (Client)
The robot controller web application is based on web, And the 
client application developed using ReactJs. The main responsibility 
of this project is providing a good user interface to control the remote Robot.
You can run this project on **another machine** or you even can run it on the 
robot RPI computer.

[Read more](/robot-web-control/Readme.md) about the robot web app controller and installation guides.

### :electric_plug:	 Hardwares & Modules
The list below, includes all necessary modules and hardwares to make the robot and the  
design depended parts were ignored in this list. 
- 1 x Tank chassis with 2 DC motors 
- 1 x Raspberry PI 4
- 1 x Raspberry PI camera (OV5647)
- 1 x L298 motor driver controller module
- 1 x SG90 Servo motor
- 1 x HX-2S-10 Series Li-ion battery managment system (BMS) module
- 1 x TP-5100 Series Li-ion battery charger module
- 2 x 5V-2A DC/DC Step-down voltage converter module (MP1584EN, MINI-360 ...)
- 1 x 2A DC/DC Boost voltage converter module (MT3608 Module)
- 4 x Li-ion 18650 battery (~2600mah)
- 1 x USB to Type-C cable
- 1 x Two way electric switch 


### :warning: Security!
Make sure about your Wifi modem that there you haven't got any **data leak**! Transmitting the camera and control data happens over the **insecure http & ws** protocols, you can secure the connections by implementing the **https & wss** contexts.