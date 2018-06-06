# global-input-node
The global-input-node WebSocket server (Global Input WebSocket Server) is a WebSocket Server, which is implemented to support the data transfer between applications that use the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library to transfer data via the end-to-end encryption. The global-input-message JavaScript library is available at:
[https://github.com/global-input/global-input-message](https://github.com/global-input/global-input-message).

A WebSocket client application can simply pass the unencrypted messages to the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library, and the JavaScript library encrypts the message content and forwards them over to the destination. On the receiving end, the WebSocket client application can simply register a callback function to the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library to receive the decrypted messages. The JavaScript library is responsible for receiving the encrypted messages, decrypting them and passing the decrypted message over to the registered callback function.

The WebSocket server uses API key values to assign the WebSocket workloads to different nodes (it can be the same node). The WebSocket server looks up the API key value contained in the request from its configuration to decide which WebSocket server node should serve the request. Hence, a WebSocket client application needs to be pre-configured to use one of the accepted API key values in order to be able to connect to the WebSocket server.

The end-to-end encryption details and the message routing logic is implemented transparently inside the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library and the [WebSocket server](https://github.com/global-input/global-input-node).  This enables the WebSocket client applications can concentrate on the business logic. Here, a simple overview is given to explain how it is done behind the scene. The global-input-message JavaScript library registers the WebSocket client application to the WebSocket server with a  ```session``` value. A ```session``` value is a random string value generated inside the client application to represent the client, and it forms a part of the event queue name that the WebSocket client application has subscribed to (or listening to). The WebSocket client application that has registered the ```session``` is called as ```owning client```, and it owns the corresponding WebSocket queue. Another WebSocket client application, which would like to connect to the ```owning client```, is called as ```calling client```. The ```calling client``` needs to obtains the ```session``` value of the ```owning client``` in order to connect to the ```owning client```. Also, the encryption key used for the end-to-end encryption is generated inside the ```owning client```. Unlike the ```session``` value, the encryption key will never be passed over to the WebSocket server and should only be transferred to the ```calling client``` directly without involving network connection. This is important because the WebSocket server should never be able to decrypt the content of the messages, and only the client applications involved in the communication should be able to decrypt the content of the messages. So, even if the WebSocket server is hacked, the messages between the client applications are safe. The owning client shares this information via the QR code. The QR code contains the encryption key for this session, the URL to the WebSocket server, API key value, and the ```session``` value. The ```calling client``` application scans the QR code to obtain these information and connect to the WebSocket server.   Now the ```owning client``` application and the ```calling client``` application can send messages to each other securely using the end-to-end encryption.

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
If you run the Nginx (Docker container configuration is provided in this repository) in front of the WebSocket server, the value of the ```url``` can be :
```
        "url":"http://<you-domain>"
```

### Run the WebSock server
Assuming that you are still in the ```app``` folder, type the following command to run the NodeJS server:
```
nodejs  server.js
```

### Build and Deploy with Docker Containers To Your Server
Prerequisite of this section:
1. Install the maven build tool on your workstation.
2. Install Docker and [Docker Compose](https://docs.docker.com/compose/install/) on your target server

Change your current folder to the WebSocket workspace folder. If you are still in its ```app``` subfolder, change to its parent:
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

The shell script in the command The command execute the start.sh script on the target server to start all the containers using the Docker Compose.


Finally, you can test it out on your browser:

```
http://<your-domain>/
```

What is displaying on your browser should be identical to https://globalinput.co.uk except the examples there will be using your own WebSocket server instead. The source of the web application you are seeing is available at:

https://github.com/global-input/global-input-web


You can go to the settings of your Global Input App and change URL to point to your own WebSocket Server.
