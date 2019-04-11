# global-input-node
This is a Global Input App(GIA) WebSocket server, responsible for routing encrypted messages between device applications,  and is one of the constituent parts of [the GIA mobile integration solution](https://globalinput.co.uk/). The [Global Input App(GIA)](https://globalinput.co.uk/) with its extensions provides a universal mobile integration solution for web and device applications, allowing users to use mobiles to operate on those applications, and provides the following functionalities:
 - [Mobile Authentication](https://globalinput.co.uk/global-input-app/mobile-authentication)
 - [Mobile Input & Control](https://globalinput.co.uk/global-input-app/mobile-input-control)
 - [Second Screen Experience](https://globalinput.co.uk/global-input-app/second-screen-experience)
 - [Mobile Personal Storage](https://globalinput.co.uk/global-input-app/mobile-personal-storage)
 - [Mobile Encryption & Signing](https://globalinput.co.uk/global-input-app/mobile-content-encryption)
 - [Mobile Content Transfer](https://globalinput.co.uk/global-input-app/mobile-content-transfer)

### Download
Download the Node.JS application and its dependencies :
```shell
    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node
    cd app
    npm install
```

### Modify the Configuration
Open the configuration file [/app/config/config.json](https://github.com/global-input/global-input-node/blob/master/app/config/config.json), locate the url attribute:
```
....
    "name":"default",
    "apikey":"k7jc3QcMPKEXGW5UC",
    "url":"https://node3.globalinput.co.uk"
...       
```
and modify its value to point to your own GIA WebSocket server instance.  The URL is going to be used by both the application running on your device and the Global Input App running on your mobile, to connect to your WebSocket server instance. Hence,  the URL should be reachable from the network that your devices are connected to. For example, if you use a URL with an internal network address, the device and your mobile should be connected to the same network.

### Run the WebSock server
run the Node application:
```
nodejs  server.js
```
This repository also contains the scripts for building the docker images for [the WebSocket Server Container](https://cloud.docker.com/u/dilshat/repository/docker/dilshat/global_input_node) and [the Nginx Reverse Proxy Container](https://cloud.docker.com/repository/docker/dilshat/global_input_nginx) .  

### Configuring the GIA Extensions

The details of the communication between the WebSocket server are encapsulated within the GIA extensions so that applications can just provide mobile user interfaces and callbacks to process mobile events. The GIA extensions are:

 - [GIA Chrome Extension](https://github.com/global-input/chrome-extension)
 - [GIA WordPress Plugin](https://github.com/global-input/wordpress-login))
 - [GIA React Extension](https://github.com/global-input/global-input-react))
 - [GIA JS Extension](https://github.com/global-input/global-input-message)

A GIA extension library connects to a GIA WebSocket server and displays an Encrypted QR Code to tell GIA how to connect to it.  The URL of the WebSocket server and the APIKey value required connecting to the WebSocket server
are contained in the Encrypted QR Code contains
If you are using [the GIA Chrome Extension](https://github.com/global-input/chrome-extension), click on ```Communication Settings``` in the extension window. You can modify the WebSocket URL and the API key values that are used by the GIA Chrome extension to connect to the WebSocket server.

If you are using the [GIA React Extension]([https://github.com/global-input/global-input-react](https://github.com/global-input/global-input-react)) or [the GIA JS Extension](https://github.com/global-input/global-input-message),  you can  set the URL and APIKey value of your WebSocket server in the mobile config:
```
let mobileConfig={			
		url:<url to your websocket server>,
        apikey:<apikey required for connection>,
		initData:{
			form:{
			  ...
			}

		}
```


### Load Balancing

In order to  separate the load from the load balancer itself, when connecting to the WebSocket server, an application will first do a normal RestAPI call to obtain the actual URL of the WebSocket Server node that it needs to connect to as show in the following diagram:
