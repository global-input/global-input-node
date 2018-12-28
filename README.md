# global-input-node
The Global Input WebSocket server (global-input-node) provides a secure communication mechanism between the Global Input App (https://globalinput.co.uk/) and the applications running on devices. The device-to-device communication is secured with the end-to-end encryption. The communicating applications need to include the [global-input-message](https://github.com/global-input/global-input-message)  extension library to communicate with each other securely.

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

### Docker Image
```
docker run -d --name global_input_node -p 1337:1337 -i -t \
-v /root/globalinput/app:/app \
dilshat/global_input_node:1.2.1
```
If you would like to put Nginx in front:
```
docker run -d --name global_input_nginx -p 80:80 -p 443:443  -i -t -v /root/globalinput/etc/nginx/esb:/etc/nginx/esb \
-v /root/globalinput/etc/nginx/sites-available:/etc/nginx/sites-available \
-v /root/globalinput/etc/nginx/ssl:/etc/nginx/ssl \
-v /root/globalinput/web:/data/websites/globalinput \
-v /root/globalinput/web:/var/www/html \
dilshat/global_input_nginx:1.2.7
```
