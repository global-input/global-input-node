var fs = require('fs');
const minimist     = require('minimist');

var logToConsole=function(message){
      console.log(new Date()+":"+message);
}
var errorToConsole=function(message){
  console.error(new Date()+":"+message);
}
var globalInputMessenger={

  createGUID:function() {
     function s4() {
       return Math.floor((1 + Math.random()) * 0x10000)
         .toString(16)
         .substring(1);
     }
     return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
       s4() + '-' + s4() + s4() + s4();
   },
    registry:new Map(),
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
       console.log("(*(((()))))")
       this.ionamespace.on("connect", this.onConnect.bind(this));
    },
    processArguments:function(argv){
        var  pathToConfigFile = minimist(argv).config;
        if(!pathToConfigFile){
            this.configPath="config/config.json";
            logToConsole("using fallback config file path")
        }
        else{
            this.configPath=pathToConfigFile;
        }
        logToConsole("pathToConfigFile:"+this.configPath);
    },

    loadConfig:function(){
        var configPath=this.configPath;
        if(configPath && (!configPath.startsWith("/"))){
            configPath=__dirname+"/"+configPath;
        }
        logToConsole("checking the config file:"+configPath);

        if(configPath && fs.existsSync(configPath)){
            logToConsole("loading the configuration:"+configPath);
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        else{
            logToConsole("not exists:"+configPath);
        }
    },

    loadIndexFile:function(req,res){
        logToConsole("------received test request----");
        res.sendFile(__dirname+"/index.html");
    },
    logger:function(err, req, res, next){
        logToConsole(" GOT Request:::::::::!!!!");
        next(err)
    },
    processError:function(error,message){
      errorToConsole(error+" "+message);
      if(error&& error.stack){
        console.error(error.stack);
      }
    },
    isApiKeyValid:function(apikey){
        if(this.config.apikeys.indexOf(apikey)>=0){
          return true;
        }
        else{
          return false;
        }
    },

    onConnect:function(socket){
        console.log("*********");
        logToConsole(" a socket connected:" +socket.id);
        socket.on("disconnect", function(){
            logToConsole("the socket is diconnected:"+socket.id);
        });
        var that=this;
        var onRegister=function(registerMessage){
              logToConsole("register message is received:"+registerMessage);
              try{
                  that.onRegister(socket,JSON.parse(registerMessage));
              }
              catch(error){
                  that.processError(error," in registerSocket");
              }
              socket.removeAllListeners("register");
        };
        socket.on("register",onRegister);
        const registerPermissionMessage={
              result:"ok"
        }
        socket.emit("registerPermission", JSON.stringify(registerPermissionMessage));
    },
    onRegister:function(socket,request){
            if(!this.isApiKeyValid(request.apikey)){
              logToConsole("apikey is not valid:"+request.apikey)
              return false;
            }
            var that=this;
            const registerItem={
                socket:socket,
                apikey:request.apikey,
                sessionGroup:request.sessionGroup,
                session:request.session,
                client:request.client,
                time:new Date()
            };
            this.registry.set(registerItem.session,registerItem);
            socket.on("disconnect", function(){
                  that.registry.delete(registerItem.session);
                  logToConsole("removed the register:"+registerItem.session+":"+that.registry.size);
            });
            logToConsole("registered:"+registerItem.session+":"+this.registry.size);
            socket.on("inputPermision", function(data){
              logToConsole("inputPermision Message is received:"+data);
               try{
                    that.onInputPermission(registerItem,JSON.parse(data));
                  }
                  catch(error){
                    that.processError(error," in requestJoin");
                  }
                  socket.removeAllListeners("inputPermision");
            });
            var registeredMessage={
                  result:"ok",
            }
            socket.emit("registered",JSON.stringify(registeredMessage));
    },
    onInputPermission:function(registerItem, inputPermissionMessage){
            if(registerItem.client!==inputPermissionMessage.client){
                  this.log("wrong client vaue");
                  return;
            }
            if(registerItem.session!==inputPermissionMessage.session){
                  this.log("wrong session vaue");
                  return;
            }
            if(!inputPermissionMessage.inputSession){
              this.log("input permission message missing input session");
              return;
            }
            const receiver=this.registry.get(inputPermissionMessage.inputSession);
            if(receiver==null){
                logToConsole("there is not such receiver:"+inputPermissionMessage.inputSession);
                return;
            }
            if(receiver.sessionGroup !== inputPermissionMessage.sessionGroup){
              logToConsole("sessionGroup does not match:"+inputPermissionMessage.sessionGroup+"!="+receiver.sessionGroup);
              return;
            };
            var that=this;
            var onInputPermissionResult=function(data){
              logToConsole("inputPermissionResult is received:"+data);
               try{
                    that.onInputPermissionResult(registerItem,inputPermissionMessage,receiver,JSON.parse(data));
                  }
                  catch(error){
                    that.processError(error," in  processJoinRequestResult");

                  }
                  receiver.socket.removeListener(receiver.session+"/inputPermissionResult",onInputPermissionResult);
            };
            receiver.socket.on(receiver.session+"/inputPermissionResult", onInputPermissionResult);
            receiver.socket.emit(receiver.session+"/inputPermission",JSON.stringify(inputPermissionMessage));
    },

    onInputPermissionResult:function(registerItem,inputPermissionMessage,receiver,inputPermissionResult){
          if(inputPermissionResult.allow){
                const inputMessageListener=function(inputMessage){
                  logToConsole("forwarding the input message:"+receiver.session+" message:"+inputMessage);
                    receiver.socket.emit(receiver.session+"/input",inputMessage);
                };
                const reverseInputMessageListener=function(inputMessage){
                    logToConsole("forwarding the reverse input message:"+receiver.session+" message:"+inputMessage);
                    registerItem.socket.emit(receiver.session+"/input",inputMessage);
                }
                const metadataListener=function(metadata){
                    logToConsole("forwarding the metadata:"+medata);
                    registerItem.socket.emit(receiver.session+"/metadata",metadata);
                }

                registerItem.socket.on(receiver.session+"/input",inputMessageListener);
                receiver.socket.on(receiver.session+"/input",reverseInputMessageListener);
                receiver.socket.on(receiver.session+"/metadata",metadataListener);
                receiver.socket.on("disconnect", function(){
                      registerItem.socket.removeListener(receiver.session+"/input",inputMessageListener);
                      logToConsole("inputMessage messageListener is removed");
                });
                registerItem.socket.on("disconnect", function(){
                      receiver.socket.removeListener(receiver.session+"/input",reverseInputMessageListener);
                      receiver.socket.removeListener(receiver.session+"/metadata",metadataListener);
                      receiver.socket.emit(receiver.session+"/leave",JSON.stringify(inputPermissionMessage));
                      logToConsole("reverse inputMessage messageListener is removed");
                });
                registerItem.socket.emit(receiver.session+"/inputPermissionResult",JSON.stringify(inputPermissionResult));
          }
          else{
              logToConsole("inputPermissionResult message says it is not allowed");
          }

    },

};
module.exports=globalInputMessenger;
