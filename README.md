# Global Input App WebSocket Server
This is a WebSocket server that is used by [Global Input App](https://globalinput.co.uk/) and the client applications to communicate with each other. Sine messages are secured using the end-to-end encryption, WebSocket servers  can be installed on unsecured environments. Web applications can also use the WebSocket server to implement live streaming using WebRTC. This WebSocket server use the API Key to  identify/authenticate incoming requests and is able to distribute them to multiple nodes to manage scalability without any additional service/components.

### Download
Download the application source code:
```shell
    git clone https://github.com/global-input/global-input-node.git
    cd global-input-node
    cd app
    npm install
```

### Modify the Configuration
The configuration file [/app/config/config.json](https://github.com/global-input/global-input-node/blob/master/app/config/config.json) contains the API Keys and the addresses of the WebSocket nodes. So it is important to modify it to point to your own WebSocket server(s) before running it(them).

### Run an instance.

```
nodejs  server.js
```
Alternative, you can build a docker image or download it from the [docker hub](https://cloud.docker.com/u/dilshat/repository/docker/dilshat/global_input_node).
