var fs = require('fs');
const minimist     = require('minimist');

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
    onConnect:function(socket){
        console.log(" a socket connected:" +socket.id);
        var that=this;
        socket.on("disconnect", function(){
            console.log("the socket is diconnected:"+socket.id);
        });
        socket.on("register", function(registerMessage){
          console.log("register message is received");
          try{
              that.registerSocket(socket,JSON.parse(registerMessage));
          }
          catch(error){
              that.processError(error," in registerSocket");
          }
          socket.removeAllListeners("register");
        });
        const initiateRegisterMessage={
              action:"register",
              socketid:socket.id
        }
        socket.emit("register", JSON.stringify(initiateRegisterMessage));
    },

    registerSocket:function(socket,request){
            var that=this;
            const registerItem={
                socket:socket,
                application:request.application,
                session:request.session,
                client:request.client,
                time:new Date()
            };
            /*
            if(this.registry.get(registerItem.session)!=null){
                console.error("session already registered:"+registerItem.session);
                return;
            }
            */
            this.registry.set(registerItem.session,registerItem);
            socket.on("disconnect", function(){
                  that.registry.delete(registerItem.session);
                  console.log("removed the register:"+registerItem.session+":"+that.registry.size);
            });
            console.log("registered:"+registerItem.session+":"+this.registry.size);
            socket.on("requestToJoin", function(joinMessage){
              console.log("requestToJoin Message is received:"+joinMessage);
               try{
                    that.processJoinMessage(registerItem, JSON.parse(joinMessage));
                  }
                  catch(error){
                    that.processError(error," in requestJoin");
                  }
                  socket.removeAllListeners("requestToJoin");
            });

    },
    processJoinMessage:function(registerItem, joinMessage){

            const targetClient=this.registry.get(joinMessage.session);
            if(targetClient==null){
                console.log("target client does not exist for:"+joinMessage.session);
                return;
            }
            if(targetClient.application && targetClient.application !== joinMessage.application){
              console.log("application does not match:"+joinMessage.application+"!="+targetClient.application);
              return;
            }
            this.listenOnJoinMessageResponse(targetClient,registerItem,joinMessage);
            targetClient.socket.emit(joinMessage.session+"/join",JSON.stringify(joinMessage));
    },
    listenOnJoinMessageResponse:function(targetClient, registerItem,joinMessage){
      var that=this;
      targetClient.socket.on("joinMessageResponse", function(response){
        console.log("joinMessageResponse is received:"+response);

         try{
              that.processJoinMessageResponse(registerItem,joinMessage,targetClient,JSON.parse(response));
            }
            catch(error){
              that.processError(error," in  processJoinRequestResult");

            }
            targetClient.socket.removeAllListeners("joinMessageResponse");
      });
    },
    processJoinMessageResponse:function(registerItem,joinMessage,targetClient,responseMessage){
          if(responseMessage.allow){
                const inputMessageListener=function(inputMessage){
                    targetClient.socket.emit(targetClient.session+"/input",inputMessage);
                };
                registerItem.socket.on("inputMessage",inputMessageListener);
                targetClient.socket.on("disconnect", function(){
                      registerItem.socket.removeListener("inputMessage",inputMessageListener);
                      console.log("inputMessage messageListener is removed");

                });
                registerItem.socket.on("disconnect", function(){
                  targetClient.socket.emit(targetClient.session+"/leave",joinMessage);
                });
          }
    },

};
module.exports=globalInputMessenger;
