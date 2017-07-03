const express=require('express');
const bodyParser = require('body-parser');
const app=express();
const http=require('http').Server(app);
const io=require('socket.io')(http);

const querystring = require('querystring');

var globalInputMessenger=require('./messenger.js');

var websocketport = 1337;
var env_port = 8080; 
var host = 'external-api.host'; 

globalInputMessenger.io=io;




app.get("/", function(req,res){
    globalInputMessenger.loadIndexFile(req,res);
});

app.get("/global-input-messenger/", function(req,res){
    globalInputMessenger.loadIndexFile(req,res);
 });

app.use(globalInputMessenger.logError.bind(globalInputMessenger));

io.on("connect", globalInputMessenger.onConnect.bind(globalInputMessenger));
  
  

var httpServer= http.listen(websocketport,function(){
  console.log("websocket is listenning on:"+websocketport);
});






