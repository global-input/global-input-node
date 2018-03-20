var fs = require('fs');
const minimist     = require('minimist');
const winston = require('winston')

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp':true})
    ]
});

var QRCode = require('qrcode');

var errorToConsole=function(message){
  console.error(new Date()+":"+message);
}
httpResponseHeader={
          'Content-Type': "application/json",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type,apikey',
          'Access-Control-Max-Age': 86400
    };
var qrcodeutil={
    registry:new Map(),
    configPath:"config/config.json",
    init:function(argv){
       this.processArguments(argv);
       this.loadConfig();
    },
    processArguments:function(argv){
        var  pathToConfigFile = minimist(argv).config;
        console.log("********:"+pathToConfigFile);
        if(!pathToConfigFile){
            this.configPath="config/config.json";

        }
        else{
            this.configPath=pathToConfigFile;
        }
        logger.log('info',"using config file path",{configPath:this.configPath});
    },

    loadConfig:function(){
        var configPath=this.configPath;
        if(configPath && (!configPath.startsWith("/"))){
            configPath=__dirname+"/"+configPath;
        }


        if(configPath && fs.existsSync(configPath)){
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            winston.level=this.config.winston.logLevel;
        }
        else{
            logger.log('error',"config file does not exist",{configPath:configPath});
        }

    },
    loadIndexFile:function(req,res){
        res.sendFile(__dirname+"/index.html");
    },
    qrcodeimage:function(request,response){
      var level = request.params.level;
      var content=request.params.content;
      response.setHeader('Content-type','image/png');
      QRCode.toFileStream(response,content,{errorCorrectionLevel:level});
    }
};
module.exports=qrcodeutil;
