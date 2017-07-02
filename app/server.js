const express=require('express');
const bodyParser = require('body-parser');
const app=express();
const http=require('http').Server(app);
const io=require('socket.io')(http);

const querystring = require('querystring');

var websocketport = 1337;
var env_port = 8080; 
var host = 'external-api.host'; 

var sockets=[];



app.get("/", function(req,res){
   res.sendFile(__dirname+"/index.html");
});


io.on("connect", function(socket){
    sockets.push(socket);
    console.log(" a user connected:"+socket.id+":"+sockets.length);
  socket.on("disconnect", function(){
    
    var pos=sockets.indexOf(socket);
    if(pos>=0){
        sockets.splice(pos, 1);
    }
    console.log("useer disconnected:"+socket.id+":"+":"+sockets.length);
  });
  
  socket.on("sendToClient", function(data){
      console.log("Received the data:"+data);
      const parseData=JSON.parse(data);
      if(parseData.clientId){
          io.emit(parseData.clientId, JSON.stringify(parseData.message));
      }      
  });
  
  
  
});

var httpServer= http.listen(websocketport,function(){
  console.log("websocket is listenning on:"+websocketport);
});






