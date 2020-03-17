# Global Input App WebSocket Server
This is a WebSocket server responsible for relaying encrypted messages between devices. 
Because the Mobile Integration Platform, which is powered by [Global Input App](https://globalinput.co.uk/), secures data using end-to-end encryption at the device-to-device level, the WebSocket server can run on an unsecured infrastructure. 

### Download
Download the application source code:
```shell
    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node
    cd app
    npm install
```

### Modify the Configuration
The configuration file [/app/config/config.json](https://github.com/global-input/global-input-node/blob/master/app/config/config.json) contains the information to inform the devices how to connect to the WebSocket server:
```
....
    "name":"default",
    "apikey":"k7jc3QcMPKEXGW5UC",
    "url":"https://node3.globalinput.co.uk"
...       
```
The value of the ```apikey``` parameter is used to control which device applications can use the resource represented by the Web Socket server, and it does not have any data security implication.  You can modify the value of the ```url``` parameter to reflect the infrastructure that is set up to run your WebSocket server. The ```url``` should be reachable to both the device application and the mobile app (Global Input App) in order to communicate with each other.

### Run an instance.

```
nodejs  server.js
```
Alternative, you can build a docker image using the script the repository or download from the [docker hub](https://cloud.docker.com/u/dilshat/repository/docker/dilshat/global_input_node). You may place a [Nginx load balancer](https://cloud.docker.com/repository/docker/dilshat/global_input_nginx) in front of a set of WebSocket instances to achieve the scalability.





