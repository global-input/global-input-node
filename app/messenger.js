var fs = require('fs');
const minimist     = require('minimist');

var globalInputMessenger={       
    sockets:[],  
    configPath:"config/config.json",    
    init:function(io, argv){
       this.io=io;
       this.processArguments(argv);
       this.loadConfig();
       if(this.config.namespace){
           this.ionamespace=io.of(this.config.namespace);
       }
       else{
           this.ionamespace=io;           
       }
       
       this.ionamespace.on("connect", this.onConnect.bind(this));       
    },
    processArguments:function(argv){       
        var  pathToConfigFile = minimist(argv).config;
        if(!pathToConfigFile){
            this.configPath="config/config.json";        
            console.log("using fallback config file path")
        }
        else{
            this.configPath=pathToConfigFile;            
        }        
        console.log("pathToConfigFile:"+this.configPath);
    },
    
    loadConfig:function(){       
        if(this.configPath && fs.existsSync(this.configPath)){
            console.log("loading the configuration:"+this.configPath)            
            
            //this.config=require(__dirname+"/"+pathToConfigFile);
            this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));            
        }            
        else{
            console.log("not exists:"+this.configPath);
        }
    },
    
    loadIndexFile:function(req,res){
        console.log("------received test request----");
        res.sendFile(__dirname+"/index.html");  
    },
    logger:function(err, req, res, next){
        console.log(" GOT Request:::::::::!!!!");
        next(err)  
    },
    
    onConnect:function(socket){
        this.sockets.push(socket);
        console.log(" a user connected:" +socket.id+":"+this.sockets.length);
        var that=this;
        socket.on("disconnect", function(){        
            that.onDisconnect(socket);
        });
        socket.on("sendToClient", this.onReceiveSendeToClientMessage.bind(this));
    },
    onDisconnect:function(socket){
        var pos=this.sockets.indexOf(socket);
        if(pos>=0){
            this.sockets.splice(pos, 1);
        }
        console.log("useer disconnected:"+socket.id+":"+":"+this.sockets.length);
    },
    onReceiveSendeToClientMessage:function(data){
        console.log("Received the data:"+data);
        const parseData=JSON.parse(data);
        if(parseData.clientId){
            this.ionamespace.emit(parseData.clientId, JSON.stringify(parseData.message));
        }
    }
        
};
module.exports=globalInputMessenger;