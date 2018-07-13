# global-input-node
The Global Input WebSocket server (global-input-node) is part of the Global Input Platform (https://globalinput.co.uk/global-input-app/paltform), which is implemented to support the data transfer between applications that use the Global Input JavaScript [global-input-message](https://github.com/global-input/global-input-message)  library to transfer data using end-to-end encryption.

### Download the source code
Run the following commands to install the WebSocket server:
```shell
    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node
    cd app
    npm install
```

### Modify the configuration
Go to the downloaded folder, use your text editor to open the configuration file
    [/app/config/config.json](https://github.com/global-input/global-input-node/blob/master/app/config/config.json)


You should see the following content in your text editor:
```
{
 "port":1337,
 "namespace":"",
 "winston":{
   "logLevel":"info"
 },
 "node":{
   "accept":["default"]
 },
 "applications":[{
    "name":"default",
    "apikey":"k7jc3QcMPKEXGW5UC",
    "url":"http://@@@Your-Server-Domain-Name@@@"
   }]

}

```
You only need to modify the value of the ```url``` in the ```applications``` section of the configuration in order to make it work. If you expose the Node Server directly without using the Nginx in front:
```
        "url":"http://<server-domain/server-ip>:1337"
```
If you [build and deploy with Docker containers](#build-and-deploy-with-docker containers), the value of the ```url``` will be :
```
        "url":"http://<you-domain>"
```

### Run the WebSock server
Assuming that you are still in the ```app``` folder, type the following command to run the NodeJS server:
```
nodejs  server.js
```

### Build and Deploy with Docker Containers
Prerequisite of this section:
1. Install the maven build tool on your workstation.
2. Install Docker and [Docker Compose](https://docs.docker.com/compose/install/) on your target server

Change your current folder to the WebSocket Server workspace folder. If you are still in its ```app``` subfolder, change to its parent:
```
cd ..
```
Then type the following command, which will create a deployment zip file:
```
deploy/package.sh
```

On completion, in the console, it will print the instruction on running the next command to deploy the zip file to your server.

```
deploy/deploy.sh <host-name-of-your-server> <user-name-for-connecting-to-your-server> <version>
```
Executing the command above deploy the zip file to the target server.

On completion, in the console, it will also print the instruction on running the next command to start all the Docker containers.

The shell script in the command executes the start.sh script on the target server to start all the containers using the Docker Compose.

Finally, you can test it out on your browser:

```
http://<your-domain>/
```

What is displaying on your browser should be identical to https://globalinput.co.uk except the examples there will be using your own WebSocket server instead. The source of the web application you are seeing is available at:

https://github.com/global-input/global-input-web


You can go to the settings of your Global Input App and change URL to point to your own WebSocket Server.
