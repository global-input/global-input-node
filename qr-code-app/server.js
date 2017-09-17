const express=require('express');
const bodyParser = require('body-parser');
const app=express();
const http=require('http').Server(app);


const querystring = require('querystring');

var qrcodeutil=require('./qrcodeutil.js');
qrcodeutil.init(process.argv.slice(2));

app.get("/qr-code/:level/:content", qrcodeutil.qrcodeimage.bind(qrcodeutil));

var httpServer= http.listen(qrcodeutil.config.port,function(){
  console.log("qrcode is listenning on:"+qrcodeutil.config.port);
});
