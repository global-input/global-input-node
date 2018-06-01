# global-input-node

global-input-node (Global Input WebSocket Server) is a WebSocket Server implemented to support the data transfer between applications that use the global-input-message JavaScript library to transfer data using the end-to-end encryption. The global-input-message JavaScript library is available at:

[https://github.com/global-input/global-input-message](https://github.com/global-input/global-input-message).

The [global-input-message](https://github.com/global-input/global-input-message) JavaScript library uses the Global Input WebSocket server to transfer the encrypted data between different WebSocket client applications. The WebSocket server assigns (distributes) the WebSocket workload to a node (can be the same node) based on the API key that the WebSocket client application uses. And then, the client application registers itself to the WebSocket server by providing a ```connectionId``` value and a ```securityGroupId``` value. These values are random string values generated inside the application. The ```connectionId``` value forms a part of the event queue name that the client application has subscribed to. The ```securityGroup``` value is for verifying the messages before sending to the corresponding event queue. In other words, only those messages that contains the matching ```connectionId``` value and the matching ```securityGroup``` value will be able to reach the owning client application.  

If the application ```A``` needs to send a message to the application ```B```, the application ```A``` needs to include the ```connectionId``` and ```securityGroupId``` values of the application ```B```. And this is not enough: the application ```A``` needs to obtain the encryption key that is generated on the fly inside the application B. Without the encryption key, the applications will not be able to decrypt each other's messages. And unlike other values, the encryption key will never be passed over to the WebSocket server. This is important because the WebSocket server should not be able to decrypt the content of the messages and only the receiving client application should be able to decrypt the content of the messages. Hence, even if the server is hacked, the messages between the client applications are safe. These important connection parameters as well as the encryption key are shared between applications with the help of QR codes. The application B display a QR code that contains all these necessary parameter values. The application A scans the QR code to obtain the encryption key,the URL to the WebSocket server, the ```apikey``` value, the ```conectionId``` and the ```securityGroupId``` values. And then the following sequence of the events happens:
(1) Application connects to the WebSocket Server with the API key to request to use a WebSocker server.
(2) The WebSocket server grants permission to use a WebSocket Server node.
(3) The Application A connects to the specified WebSocket server with the API key and register itself.
(5) The Application A send a permission request message including the obtained ```connectionId``` and the ```securityGroupId``` value. The message content is encrypted with the encryption key that is obtained from the QR code.
(6) The WebSocket server deliver the message to the application B.
(7) The application B grant the permission to connect by sending back the response.
(8) Now, the Application A and Application B can send the message to each other. The global-input-messgae JavaScript library included in the applications is responsible for encrypting and decrypting the message content.

The Global Input App (([https://globalinput.co.uk](https://globalinput.co.uk)) is the application A in the  scenario above, and the service application that supports the Global Input App is the application B. When carrying out the end-to-end encrypted data transfer between mobiles, another Global Input App instance plays the role of application B.  You can find these parameters in the Preference screen of the Global Input App and you can modify them there. Alternatively, you can scan to obtain the configuration parameters.

### Download the source code
run the following commands:

    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node
    cd app
    npm install
    nodejs server.js


### Modify the configuration.
Open the configuration
    [/app/config/config.json](https://github.com/global-input/global-input-node/blob/master/app/config/config.json)
with a text editor

its content is listed here:
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
    "url":"https://globalinput.co.uk"
   }]
}

```
The most significant part is the ```applications``` block, which defines an array of WebSocket Server nodes. Each element in the array has three attributes, ```name```, ```apikey```, ```url```
You need to set the value of the ```url``` to the URL that can be used to reach your WebSocket application. For example, if you are running the server application locally (both client and server running on the same host), the value can be set to

       http://127.0.0.1:1337
otherwise, it can be:
        http://<server-domain/server-ip>:1337

or if you run the Nginx (Docker container configuration is provided in this repository) in front with SSL configuration:
        https://<you-domain>
The value of the ```apikey``` in the configuration can be set to any random strings.  A WebSocket client has to use the URL and the API key value to establish the connection successfully.
A WebSocket client application will first request to use the WebSocket server by including the ```apikey``` value in the request.  The WebSocket server grant to use a node if the ```apikey``` value is found in one of the emement in the ```applications``` array specified in the configuration. If it is granted, the client application receives the URL specified in the matching configuration element. The WebSocket client then uses the URL and API key in the configuration to establish the WebSocket connection to the server subsequently.
Again the WebSocket server locates the matching configuration element in the ```applications``` array of the configuration. And then, it verifies whether the matching item name exists in the  the ```node/accept``` array in the congiration:
```
 "node":{
   "accept":["default"]
 },
```
If it is found, the server accepts the WebSocket connection request.
In this way, it is possible to run multiple nodes with different configurations using the same WebSocket application codes. You can configure one node to use it only for assigning the workloads to other nodes, In that case, you can set the value of  ```node/accept```  to an empty array so that the node wil not accept the actual WebSocket connection.

This repository also includes the Docker configurations for building the necessary docker containers to run the Websocket application:

[```global_input_node/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/global_input_node/Dockerfile): builds the container that runs the Global Input WebSocket NodeJS server application.  

[```nginx/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/nginx/Dockerfile): builds the container that runs the Nginx server that sits in front of the WebSocket server. So that you can just expose the HTTPS (443/80) port of the Nginx container to the outside world.

[```qr-code-node/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/qr_code_node/Dockerfile): builds the container that runs NodeJS application (qr-code-app) that creates the QR code image on the server-side. This docker container and the corresponding application is not used, because the QR code is created on the client side for the end-to-end encrypted data transfer between two devices. So the communication is safe even if the server is hacked. However, if the client device that runs the Service application does not support canvas to draw the QR code, then you may have to use this application to generate the QR Code on the server side to support the Global Input App and the use the image tag to display the QR code. In that case, you have to rely on the HTTPS and server security to protect the end-to-end data transfer between devices.

[```docker-compose.yml```](https://github.com/global-input/global-input-node/blob/master/docker-compose.yml) docker-compose file for building and starting up all the docker containers.

[```start.sh```](https://github.com/global-input/global-input-node/blob/master/start.sh) script that run the docket-compose to build and start up all the docker containers.

[```nginx/etc/nginx/sites-available/sites-available/globalinput.co.uk```](https://github.com/global-input/global-input-node/blob/master/nginx/etc/nginx/sites-available/globalinput.co.uk): The nGinx configuration file. You need to modify the fule building the Nginx container: modify the value of the  ```_server_name``` parameter to the domain name of your server. Modify the SSL section to use your server's SSL certificates.
