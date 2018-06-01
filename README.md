# global-input-node

Global Input WebSocket Server (global-input-node) is implemented in NodeJS to support the End-to-End encrypted data transfer between Service Applications and the Global Input App
([https://globalinput.co.uk](https://globalinput.co.uk)). The Web Socket client should use an API key to connect to the server to request and obtain the URL to the actual Serving WebSocket Server. This ways, the Server can assign the workload to different nodes based on the API Key value it has received. In other words, the API key values are for isoloationg the server workloads for the client applications with different categories.  

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
The most part is the ```applications``` block, which defines an array of WebSocket Server. Each element in the array has three attributes, ```name```, ```apikey```, ```url```
You need to set the value of the ```url``` to the URL that can be used to reach the application that is running. For example, if you would like run the server application locally (both client and server running on the same host), the value can be set to

       http://127.0.0.1:1337
otherwise, it can be:
        http://<server-domain/server-ip>:1337

or if you run the Nginx in front with SSL configuration:
        https://<you-domain>
The value of the ```apikey``` in the configuration can be set ro any random strings.  A WebSocket client has to use the URL and the API key value to establish the connection successfully.
The client first obtains URL to the the actual serving Websocket Server via the sending the get request with API key value to the URI path:
    /global-input/request-socket-url
The Node server receives the API key value via the HTTP header parameter or query parameter with the name ```apikey```. It tries to locate the matching element from the ```applications``` array specified in the configuration. If it is found it returns the matching configuration element to the client.
The WebSocket client then uses the URL and API key in the configuration to establish the WebSocket connection to the server.
Upon successfully obtaining the URL to the Web Socket server, the client  establishes a WebSocket connection to the server including again the ```apikey``` in the HTTP request header.
The WebSocket server search the ```apikey``` value in the ```applications``` array in the configuration. If matching item is found, it verifies whether the item name exists in the  the ```node/accept``` array in the congiration:
```
 "node":{
   "accept":["default"]
 },
```
If it is found, the server accepts the WebSocket connection request.
So you can run multiple nodes with different configurations. You can configure one node to use it only for assigning the workloads to other nodes, In that case, you can set the value of  ```node/accept```  to an empty array so that the node wil not accept the actual WebSocket connection.

The source code of the WebSocket client library is available at:
 https://github.com/global-input/global-input-message
it is used by both the Global Input App and the Service Application. The service application connects to the server and display the QR Code that contains all the information necessary for establishing the WebSocket connection to the service application via the WebSocket Server. the QR code also contains the encryption key for end-to-end encrypted data transfer.

This repository also includes the Docker configurations for building the docker containers:

```global_input_node/Dockerfile```: builds the container that runs the Global Input WebSocket NodeJS server application.  

```nginx/Dockerfile```: builds the container that runs the Nginx server that sits in front of the WebSocket server. So that you can just expose the HTTPS (443) port of the Nginx container to the outside world.

```qr-code-node/Dockerfile```: builds the container that runs NodeJS application (qr-code-app) that creates the QR code image on the server-side. This is not generally useful, because the QR code is created on the client side for the end-to-end encrypted data transfer between two devices. So the communication is safe even if the server is hacked. However, if the client device that runs the Service application does not support canvas to draw the QR code, then you may have to use this application to generate the QR Code on the server side to support the Global Input App. In that case, you have to rely on the HTTPS and server security to protect the end-to-end data transfer between devices.

```docker-compose.yml``` docker-compose file for building and starting up all the docker containers.

```start.sh``` script that run the docket-compose to build and start up all the docker containers.
