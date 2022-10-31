### Overview
It is supposed that you have installed Raspbian OS on 
the RPI, and the camera module configured fine.
You may also should install Nodejs, Before running the 
robot controller script on the RPI.

### Requirements
- Nodejs > 16.x
- NPM package manager 

### Installtion
```
cd /to-project-folder/robot-node-server
npm install
```

### Run
```
sudo node index.js
```

### Auto start after reboot
```
npm install -g pm2 
sudo pm2 start --name="RPI Robot Controller" index.js
sudo pm2 --save
```