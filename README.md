# global-input-node

global-input-node (Global Input WebSocket Server) is a WebSocket Server implemented to support the data transfer between applications that use the global-input-message JavaScript library to transfer data using the end-to-end encryption. The global-input-message JavaScript library is available at:

[https://github.com/global-input/global-input-message](https://github.com/global-input/global-input-message).

The WebSocket client applications can simply pass the unencrypted messsages to the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library, which encrypts the message content and forwards them over to the destination. On the receiving end, the WebSocket client appplication can simply register a callback function to the [global-input-message](https://github.com/global-input/global-input-message) JavaScript library to receive the decrypted messages. The JavaScript library is responsible to receive the encrypted messages, decrypt them and pass the decrypted message to the registered callback function.

The end-to-end encryption details and the message routing logic is transparently implemented inside the JavaScript library. Here a simple overview is given to explain how it is done behind the scene. First of all, the WebSocket server uses API key values to assign the WebSocket workloads to different nodes (it can be the same node). Hence,  a WebSocket client application connect to the WebSocket server with an API key value. And then, the WebSocket client application register itself with a  ```session``` value. The ```session``` value is a random string value generated inside the application, and it represent the session in the application. The session value forms a part of the event queue name that the client application has subscribed to. Therefore if the application ```A``` needs to send a message to the application ```B```, the application ```A``` needs to include the ```session``` value of the application ```B``` in the message. And this is not enough: the application ```A``` also needs to obtain the encryption key that is generated on the fly inside the application B. Without the encryption key, the applications will not be able to decrypt each other's messages. And unlike other values, the encryption key will never be passed over to the WebSocket server. This is important because the WebSocket server should not be able to decrypt the content of the messages and only the receiving client application should be able to decrypt the content of the messages. Hence, even if the server is hacked, the messages between the client applications are safe. These important connection parameters as well as the encryption key are shared between applications with the help of QR codes. The application B display a QR code that contains all these necessary parameter values. The application A scans the QR code to obtain the encryption key,the URL to the WebSocket server, the ```apikey``` value, and the ```session``` value of the application B. With these connnection details, the application A will be able to send encrypted message to the application B.

The Global Input App (([https://globalinput.co.uk](https://globalinput.co.uk)) is the application A in the  scenario above. The service application that supports the Global Input App is the application B. When carrying out the end-to-end encrypted data transfer between mobiles, another Global Input App instance plays the role of application B.  You can find these parameters in the Preference screen of the Global Input App and you can modify them there. Alternatively, you can scan to obtain the configuration parameters.

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

its content is listed below:
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
otherwise, it can be set to:
        http://<server-domain/server-ip>:1337

or if you run the Nginx (Docker container configuration is provided in this repository) in front of the WebSocket server with the SSL configuration, you can set the value of the ```url``` to:
        https://<you-domain>
The value of the ```apikey``` in the configuration can be set to any random strings.   A WebSocket client has to use the URL and the API key value to establish the WebSocket connection successfully. Note that the apikey value is not for security purpose, it is for distributing the websocket workload among different nodes. You may use different API key value in diffent environment, you can use the deployment script to search & replace the default value with the one in the target environment. It is the same for the URL value. Alternatively, you can use completely differnt configuration to start the NodeJS application using the ---config commandline argument. see the example in the script ```deploy/dev.sh```.

When a WebSocket client application request the URL to the WebSocket node using an ```apikey``` value, The WebSocket server returns the URL from the matching configuration element listed in the ```applications``` array. The WebSocket client application then uses the URL and the API key value to establish the actual WebSocket connection to the server. Again the WebSocket server locates the matching configuration element in the ```applications``` array with the ```apikey``` value in the request. And then, it verifies whether the matching item name exists in the  the ```node/accept``` array in the congiration:
```
 "node":{
   "accept":["default"]
 },
```
If it is found, the server accepts the WebSocket connection request, otherwise the server closes the connection.
In this way, it is possible to run multiple nodes with different configurations using the same WebSocket Server application codes. You can configure one node to use it only for assigning the workloads to other nodes, In that case, you can set the value of  ```node/accept```  to an empty array so that the node wil not accept the actual WebSocket connection.

This repository also includes the Docker configurations for building the necessary docker container images to run the Websocket application:

[```global_input_node/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/global_input_node/Dockerfile): builds the container image that runs the Global Input WebSocket NodeJS server application.  

[```nginx/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/nginx/Dockerfile): builds the container image that runs the Nginx server that sits in front of the WebSocket server. So that you can just expose the HTTPS (443/80) port of the Nginx container to the outside world.

[```qr-code-node/Dockerfile```](https://github.com/global-input/global-input-node/blob/master/qr_code_node/Dockerfile): builds the container image that runs NodeJS application (qr-code-app) that creates the QR code image on the server-side. This docker container and the corresponding application is not used, because the QR code is created on the client side for the end-to-end encrypted data transfer between two devices. So the communication is safe even if the server is hacked. However, if the client device that runs the Service application does not support canvas to draw the QR code, then you may have to use this application to generate the QR Code on the server side to support the Global Input App and the use the image tag to display the QR code. In that case, you have to rely on the HTTPS and server security to protect the end-to-end data transfer between devices.

[```docker-compose.yml```](https://github.com/global-input/global-input-node/blob/master/docker-compose.yml) docker-compose file for building the necessary container images and starting up all the docker containers.

[```start.sh```](https://github.com/global-input/global-input-node/blob/master/start.sh) script that run the docket-compose command to build and start up all the docker containers.

[```nginx/etc/nginx/sites-available/sites-available/globalinput.co.uk```](https://github.com/global-input/global-input-node/blob/master/nginx/etc/nginx/sites-available/globalinput.co.uk): The Nginx configuration file. You need to modify the file before building the Nginx container images: modify the value of the  ```_server_name``` parameter to the domain name of your server. Modify the SSL section to use your server's acrtuall SSL certificates. You can remove the entire section if you do not want to use the HTTPS at this stage.
