var fs = require('fs');
const minimist     = require('minimist');

var logToConsole=function(message){
      console.log(new Date()+":"+message);
}
var errorToConsole=function(message){
  console.error(new Date()+":"+message);
}
var globalInputMessenger={
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
              try{
                      logToConsole("apikey is not valid:"+request.apikey)
                      var registeredMessage={
                            result:"failed",
                            reason:"denied"
                      }
                      socket.emit("registered",JSON.stringify(registeredMessage));
                      socket.disconnect(true);

                  }
                catch(error){
                  logToConsole("error failed registered socket:"+error);
                }
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
                  logToConsole("wrong client vaue:"+registerItem.client+":"+inputPermissionMessage.client);
                  this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,"Wrong client value");
                  return;
            }
            if(registerItem.session!==inputPermissionMessage.session){
                  logToConsole("wrong session vaue");
                  this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,"Wrong session value");
                  return;
            }
            if(!inputPermissionMessage.connectSession){
              logToConsole("input permission message missing connectSession");
              this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,"Missing connectSession value");
              return;
            }
            const receiver=this.registry.get(inputPermissionMessage.connectSession);
            if(receiver==null){
                logToConsole("there is not such receiver:"+inputPermissionMessage.connectSession);
                this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage," there is no such receiver");
                return;
            }
            if(receiver.sessionGroup !== inputPermissionMessage.sessionGroup){
              this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,"sessionGroup does not match");
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
                    that.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,error);
                  }
                  receiver.socket.removeListener(receiver.session+"/inputPermissionResult",onInputPermissionResult);
            };
            receiver.socket.on(receiver.session+"/inputPermissionResult", onInputPermissionResult);
            logToConsole("sending inputPermission message to:"+receiver.session+":"+receiver.client);
            receiver.socket.emit(receiver.session+"/inputPermission",JSON.stringify(inputPermissionMessage));
    },

    onInputPermissionResult:function(registerItem,inputPermissionMessage,receiver,inputPermissionResult){
          if(!inputPermissionResult.allow){

            this.sendErrorInputPermissionResult(registerItem,inputPermissionMessage,"client refused:"+inputPermissionResult.reason);
            return;
          }
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
                      inputPermissionMessage.allow=false;
                      inputPermissionMessage.reason="received disconnected";
                      registerItem.socket.emit(receiver.session+"/leave",JSON.stringify(inputPermissionMessage));
                      logToConsole("inputMessage messageListener is removed");
          });
          registerItem.socket.on("disconnect", function(){
                      receiver.socket.removeListener(receiver.session+"/input",reverseInputMessageListener);
                      receiver.socket.removeListener(receiver.session+"/metadata",metadataListener);
                      receiver.socket.emit(receiver.session+"/leave",JSON.stringify(inputPermissionMessage));
                      logToConsole("reverse inputMessage messageListener is removed");
          });
          this.sendSucessInputPermissionResult(registerItem,receiver,inputPermissionResult);
    },
    sendSucessInputPermissionResult(registerItem,receiver,inputPermissionResult){
        registerItem.socket.emit(receiver.session+"/inputPermissionResult",JSON.stringify(inputPermissionResult));
    },
    sendErrorInputPermissionResult(registerItem,inputPermissionMessage, reason){
        inputPermissionMessage.allow=false;
        inputPermissionMessage.reason=reason;
        registerItem.socket.emit(inputPermissionMessage.connectSession+"/inputPermissionResult",JSON.stringify(inputPermissionMessage));
        console.log("input Permisson is not allowed:"+reason);
    }
};
module.exports=globalInputMessenger;
