# global-input-node
The global-input-node WebSocket server (Global Input WebSocket Server) is a WebSocket Server, which is implemented to support the data transfer between applications that use the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library to transfer data via the end-to-end encryption. The global-input-message JavaScript library is available at:
[https://github.com/global-input/global-input-message](https://github.com/global-input/global-input-message).

A WebSocket client application passes unencrypted messsages to the global-input-message JavaScript library, without worrying about the encryption and delivering of the messages. The global-input-message JavaScript library encrypts the message content with the end-to-end encryption and forwards them over to the destination. On the receiving end, the global-input-message JavaScript library receives the encrypted messages, decrypt them and forward the decrypted messages to the callback function that the application has specified.


The WebSocket server uses API key values to assign the WebSocket workloads to one of the serving nodes (it can be the same node). The WebSocket server looks up the API key value contained in the request from its configuration to decide which WebSocket server node should serve the request. Hence, a WebSocket client application needs to be pre-configured to use one of the accepted API key values in order to be able to connect to the WebSocket server.

### How It Works
The end-to-end encryption and the message trasnsporting logic are implemented transparently inside the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library and the [WebSocket server](https://github.com/global-input/global-input-node).  This enables the WebSocket client applications concentrate on the business logic.

###### Receiver Application
A ```global-input-message``` application is a ```reiceiver application``` if it connects to the WebSocket server and waits for connection from another application.

###### Calling Application
A ```global-input-message``` application is a ```calling application``` if it requests to connet to the ```Receiver application```.

###### QR Code
A ```receiver application``` uses QR Code to pre-share the necessary information with the ```calling application``` to let the ```calling application``` to find the ```Receiver``` application and establish the communication using the end-to-end encryption.

The QR code contains the following information:
(1) The ```url``` value of the WebSocket server that the ```receiver application``` has connected.
(2) The  ```apikey``` value required by the WebSocket server.
(3) A ```session``` value that uniquely identifies the ```receiver application``` on the WebSocket server.
(4) The encryption key that should be used to encrypt and decrypt the message content.

A new encryption key is generated inside the [receiver application](#receiver-application) for each session and shared with the [calling application](#calling-application) via the QR code. This means that the encryption key is transferred to the [calling application](#calling-application) directly without involving any network connection, and only the applications involved in the communication will be able to decrypt the content of the messages. So, even if the WebSocket server is hacked, the messages between the applications will be safe.

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
