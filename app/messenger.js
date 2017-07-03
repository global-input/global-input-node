var fs = require('fs');
const minimist     = require('minimist');

var globalInputMessenger={
    sockets:[],  
    configPath:"config/config.json",
    init:function(io, argv){
       this.io=io;
      // this.processArguments(argv);
    },
    processArguments:function(argv){              
        var  pathToConfigFile = minimist(argv).config;
        console.log("pathToConfigFile:"+pathToConfigFile);
        if(pathToConfigFile && fs.existsSync(pathToConfigFile)){
            console.log("loading the configuration:"+pathToConfigFile)
            configPath=pathToConfigFile;
            AWS.config.loadFromPath(pathToConfigFile);
            console.log("AWS also configured with  the configuration:"+pathToConfigFile)
        }            
        else{
            console.log("not exists:"+pathToConfigFile);
        }
    },
    loadConifg: function() {
        this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));            
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
            this.io.emit(parseData.clientId, JSON.stringify(parseData.message));
        }
    }
        
};
module.exports=globalInputMessenger;