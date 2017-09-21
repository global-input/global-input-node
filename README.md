# global-input-node

This is the websocket server used by the Global Input Software. If you would like to host your own Global Input websocket server, you need to download and run this NodeJS code.

Please visit following for more information:

> [https://globalinput.co.uk](https://globalinput.co.uk)

It include the code for building the dockers to bundle the nGinx load balancer with the NodeJS application.

If you would like to pull and run  the NodeJS application from the docker hub:

> ```docker run -t dilshat/global_input_node  --name global_input_node -p 1337:1337 ```
