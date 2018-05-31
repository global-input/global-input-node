# global-input-node

Global Input WebSocket Server (global-input-node) is implemented to support the Encrypted Data transfer between Service Applications and the Global Input App
([https://globalinput.co.uk](https://globalinput.co.uk)). The Web Socket client should use an API key to connect to the server to request the URL to the actual Serving WebSocket Server. This ways, the Server can assign the workload to different nodes based on the API Key value it has received. In other words, the API key is used for isoloationg the workloads coming from different categories of client applications.

### Download the source code
    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node

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
The most important section is the ```application``` section, which defines an array of WebSocket Node Server. Each element in the array has three attributes, ```name```, ```apikey```, ```url```
You need to set the value of the ```url``` to the URL with that the websocket client can reach your server. For example, if you only would like run the node server locally (both client and server running on the same host), the value can be set to

       http://127.0.0.1:1337

The value of the apikey can be set ro any random string value. Both the URL to the WebSocket server and the API key should be known the client in order to establish the connection successfully. The source code of the Websocket client is available at:
   https://github.com/global-input/global-input-message
The client first request URL to the the actual serving Websocket Server via the get request
    /global-input/request-socket-url
The Node server receives the API key value via the HTTP header parameter or query parameter with the name ```apikey```. It tries to locate the matching element from the ```applications``` array specified in the configuration. If it is found it returns the configuration element to the client.
The WebSocket client then uses the URL and API key in the configuration to establish the WebSocket connection to the server.
At that time, the WebSocket client again includes the API key when establishing WebSocket connection to the server.
The server again search the api from the ```applications``` array in the configuration, and if it is found, it will try to locate the matched ```name```'s value from the ```node/accept``` in the congiuration:
```
 "node":{
   "accept":["default"]
 },
```
If it is found, the server accepts the connection request.
So you can run multiple nodes with different configurations, one node can be deddicated for assigning the workloads to other nodes, in that case, you can set the value of  ```node/accept```  to an empty array so that the node wil not accept the actual WebSocket connection.

The source code of the WebSocket client library is available at:
 https://github.com/global-input/global-input-message
it is used by both the Global Input App and the Service Application. The Service Application connects to the server and display in the form of QR Code, all the connection parameters: URL, Api Key, and the other parameters that are necessary connect to the Service Application via the WebSocket server.
