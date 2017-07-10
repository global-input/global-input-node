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
        var configPath=this.configPath;
        if(configPath && (!configPath.startsWith("/"))){
            configPath=__dirname+"/"+configPath;            
        }
        console.log("checking the config file:"+configPath);
            
        if(configPath && fs.existsSync(configPath)){
            console.log("loading the configuration:"+configPath);            
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));            
        }            
        else{
            console.log("not exists:"+configPath);
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
        socket.on("sendToSession", this.onReceiveSendMessageToSession.bind(this));
    },
    onDisconnect:function(socket){
        var pos=this.sockets.indexOf(socket);
        if(pos>=0){
            this.sockets.splice(pos, 1);
        }
        console.log("useer disconnected:"+socket.id+":"+":"+this.sockets.length);
    },
    onReceiveSendMessageToSession:function(content){                
        try{
            const message=JSON.parse(content);            
            const session=message.session;
            delete message.session;
            var messageToSend=JSON.stringify(message);
            
            if(session){
                console.log("sending the message:"+messageToSend +" to:"+session)
                this.ionamespace.emit(session,messageToSend);
            }
            else{
                console.error("onReceiveSendeToClientMessage:missing session in:"+content);
            }            
        }
        catch(error){
           console.error("onReceiveSendeToClientMessage:"+error+ " for the content:"+content); 
        }
        
    }
        
};
module.exports=globalInputMessenger;