var fs = require('fs');
const minimist     = require('minimist');

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
    processError:function(error,message){
      console.error(error+" "+message);
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
        console.log(" a socket connected:" +socket.id);
        socket.on("disconnect", function(){
            console.log("the socket is diconnected:"+socket.id);
        });
        var that=this;
        socket.on("register", function(registerMessage){
          console.log("register message is received:"+registerMessage);
          try{
              that.register(socket,JSON.parse(registerMessage));
          }
          catch(error){
              that.processError(error," in registerSocket");
          }
          socket.removeAllListeners("register");
        });
        const canRegisterMessage={
              action:"register",
              socketid:socket.id
        }
        socket.emit("canRegister", JSON.stringify(canRegisterMessage));
    },
    register:function(socket,request){
            if(!this.isApiKeyValid(request.apikey)){
              console.log("apikey is not valid:"+request.apikey)
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
                  console.log("removed the register:"+registerItem.session+":"+that.registry.size);
            });
            console.log("registered:"+registerItem.session+":"+this.registry.size);
            var randomkey=this.createGUID();
            socket.on("joinSession", function(data){
              console.log("joinSession Message is received:"+data);
               try{
                    const joinSessionMessage=JSON.parse(data);
                    if(joinSessionMessage.randomkey!==randomkey){
                      console.log("random key does not match:"+joinSessionMessage.randomkey);
                      return;
                    }
                    that.joinSession(registerItem,joinSessionMessage);
                  }
                  catch(error){
                    that.processError(error," in requestJoin");
                  }
                  socket.removeAllListeners("requestToJoin");
            });

            var canJoin={
                  action:"join",
                  randomkey
            }
            socket.emit("canJoin",JSON.stringify(canJoin));
    },
    joinSession:function(registerItem, joinMessage){
            const targetClient=this.registry.get(joinMessage.session);
            if(targetClient==null){
                console.log("target client does not exist for:"+joinMessage.session);
                return;
            }
            if(targetClient.sessionGroup !== joinMessage.sessionGroup){
              console.log("sessionGroup does not match:"+joinMessage.sessionGroup+"!="+targetClient.sessionGroup);
              return;
            };
            this.listenOnJoinMessageResponse(targetClient,registerItem,joinMessage);
            targetClient.socket.emit(joinMessage.session+"/join",JSON.stringify(joinMessage));
    },
    listenOnJoinMessageResponse:function(targetClient, registerItem,joinMessage){
      var that=this;
      targetClient.socket.on("joinResponse", function(response){
        console.log("joinResponse is received:"+response);

         try{
              that.processJoinResponseMessage(registerItem,joinMessage,targetClient,JSON.parse(response));
            }
            catch(error){
              that.processError(error," in  processJoinRequestResult");

            }
            targetClient.socket.removeAllListeners("joinResponse");
      });
    },
    processJoinResponseMessage:function(registerItem,joinMessage,targetClient,responseMessage){
          if(responseMessage.allow){

                const inputMessageListener=function(inputMessage){
                  console.log("forwarding the input message:"+targetClient.session+" message:"+inputMessage);
                    targetClient.socket.emit(targetClient.session+"/input",inputMessage);
                };
                const reverseInputMessageListener=function(inputMessage){
                    console.log("forwarding the reverse input message:"+targetClient.session+" message:"+inputMessage);
                    registerItem.socket.emit(targetClient.session+"/input",inputMessage);
                }
                const metadataListener=function(metadata){
                    console.log("forwarding the metadata:"+medata);
                    registerItem.socket.emit(targetClient.session+"/metadata",metadata);
                }

                registerItem.socket.on(targetClient.session+"/input",inputMessageListener);
                targetClient.socket.on(targetClient.session+"/input",reverseInputMessageListener);
                targetClient.socket.on(targetClient.session+"/metadata",metadataListener);
                targetClient.socket.on("disconnect", function(){
                      registerItem.socket.removeListener(targetClient.session+"/input",inputMessageListener);
                      console.log("inputMessage messageListener is removed");
                });
                registerItem.socket.on("disconnect", function(){
                      targetClient.socket.removeListener(targetClient.session+"/input",reverseInputMessageListener);
                      targetClient.socket.removeListener(targetClient.session+"/metadata",metadataListener);
                      console.log("reverse inputMessage messageListener is removed");
                });

                registerItem.socket.on("disconnect", function(){
                  targetClient.socket.emit(targetClient.session+"/leave",JSON.stringify(joinMessage));
                });
                registerItem.socket.emit("joinResponse",JSON.stringify(responseMessage));
          }
          else{
              console.log("join message response says it is not allowed");
          }

    },

};
module.exports=globalInputMessenger;
