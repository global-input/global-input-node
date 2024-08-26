const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const querystring = require('querystring');

var globalInputMessenger = require('./messenger.js');





globalInputMessenger.init(io, process.argv.slice(2));

app.use(globalInputMessenger.logger.bind(globalInputMessenger));

app.get("/global-input/request-socket-url", globalInputMessenger.requestSocketServer.bind(globalInputMessenger));
app.get('/', globalInputMessenger.loadIndexFile.bind(globalInputMessenger));

//app.get("/",globalInputMessenger.loadIndexFile);



var httpServer = http.listen(globalInputMessenger.config.port, function () {
  console.log("websocket is listening on:" + globalInputMessenger.config.port);
});
