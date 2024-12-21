var fs = require('fs');
const minimist = require('minimist');
const winston = require('winston');

var winstonLogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ 'timestamp': true })
  ]
});



var clientInfoLogger = function (request, message, extraInfo) {
  if (request && request.client) {
    if (extraInfo) {
      winstonLogger.log('info', "client:" + request.client + ":" + message, extraInfo);
    }
    else {
      winstonLogger.log('info', "client:" + request.client + ":" + message);
    }

  }
  else {
    if (extraInfo) {
      winstonLogger.log('info', message, extraInfo);
    }
    else {
      winstonLogger.log('info', message);
    }

  }

}



var errorToConsole = function (message) {
  console.error(new Date() + ":" + message);
}
httpResponseHeader = {
  'Content-Type': "application/json",
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Content-Type,apikey',
  'Access-Control-Max-Age': 86400
};
var globalInputMessenger = {
  registry: new Map(),
  configPath: "config/config.json",
  init: function (io, argv) {
    this.io = io;
    this.processArguments(argv);
    this.loadConfig();
    if (this.config.namespace) {
      this.ioNamespace = io.of(this.config.namespace);
    }
    else {
      this.ioNamespace = io;
    }
    winstonLogger.log('info', "Global Input App (https://globalinput.co.uk), Copyright © 2017-2022 Iterative Solution Limited");
    this.ioNamespace.on("connect", this.onConnect.bind(this));
  },
  processArguments: function (argv) {
    var pathToConfigFile = minimist(argv).config;
    winstonLogger.log('info', "config File", { configFile: pathToConfigFile });
    if (!pathToConfigFile) {
      this.configPath = "config/config.json";


    }
    else {
      this.configPath = pathToConfigFile;
    }
    winstonLogger.log('info', "using config file path", { configPath: this.configPath });
  },

  loadConfig: function () {
    var configPath = this.configPath;
    if (configPath && (!configPath.startsWith("/"))) {
      configPath = __dirname + "/" + configPath;
    }


    if (configPath && fs.existsSync(configPath)) {
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      winston.level = this.config.winston.logLevel;
    }
    else {
      winstonLogger.log('error', "config file does not exist", { configPath: configPath });
      throw Error("Config file does not exist:" + configPath);
    }

  },

  loadIndexFile: function (req, res) {

    res.sendFile(__dirname + "/index.html");
  },
  requestSocketServer: function (req, res) {
    const { headers, params, query } = req;

    var apikey = headers['apikey'];
    if (!apikey) {
      apikey = query.apikey;
    }
    if (!apikey) {
      winstonLogger.log('info', "apikey is empty");
      this.socketServerDenied(req, res, "apikey is empty");
      return;
    }
    var application = this.getApplicationByApikey(apikey);
    if (application) {
      winstonLogger.log('info', "granted socket url ", { application });
      this.socketServerGranted(req, res, application);
    }
    else {
      winstonLogger.log('info', "denied socket url ", { apikey });
      this.socketServerDenied(req, res, "apikey does not match");
    }


  },
  appLaunched: function (req, res) {
    const session= req.query.session;
    const code= req.query.code;
    if((!session) ||(!code)){
      winstonLogger.log('info', "appLaunched: session or code not found", { session, code });
      res.writeHead(401, httpResponseHeader);
      var data = {
        result: "failed",
        reason:"session or code not found"
      };
      res.end(JSON.stringify(data));
      return;
    }
    const registeredItem=this.registry.get(session);
    if(!registeredItem){
      winstonLogger.log('info', "appLaunched: session not found", { session });
      res.writeHead(401, httpResponseHeader);
      var data = {
        result: "failed",
        reason:"session not found"
      };
      res.end(JSON.stringify(data));
      return;
    }
    if(!registeredItem.socket){
      winstonLogger.log('info', "appLaunched: socket not found", { session });
      res.writeHead(401, httpResponseHeader);
      var data = {
        result: "failed",
        reason:"socket not found"
      };
      res.end(JSON.stringify(data));
      return;
    }
    winstonLogger.log('info', "appLaunched: session found", { session });    
    const msg={
          code
    }
    registeredItem.socket.emit("app/launched",JSON.stringify(msg));    
    res.writeHead(200, httpResponseHeader);
    var data = {
      result: "ok"
    };
    res.end(JSON.stringify(data));
  },
  socketServerGranted: function (req, res, application) {
    res.writeHead(200, httpResponseHeader);
    var data = {
      result: "ok",
      url: application.url
    };
    res.end(JSON.stringify(data));
  },
  socketServerDenied: function (req, res, reason) {
    res.writeHead(401, httpResponseHeader);
    var data = {
      result: "failed",
      reason
    };
    res.end(JSON.stringify(data));
  },

  logger: function (err, req, res, next) {
    winstonLogger.log('info', "request received");
    next(err)
  },
  processError: function (error, message) {
    winstonLogger.log('error', message, { error });
  },

  parseMediaClientId: function (clientId) {

    try {

      if (clientId && clientId.startsWith('video://')) {
        let res = clientId.slice('video://'.length);
        mediaChannel = res.slice(0, res.indexOf('/'));
        res = res.slice(res.indexOf('/') + 1);
        mediaRole = res.slice(0, res.indexOf('/'));
        const mediaType = "video";
        return { mediaType, mediaChannel, mediaRole };
      }

    }
    catch (error) {
      this.processError(error, " parsing media client:" + error);
    }
    return null;
  },
  isVideoMediaClient: function (mediaRegistry) {

    return mediaRegistry && mediaRegistry.mediaProperty && mediaRegistry.mediaProperty.mediaType === 'video';
  },
  isVideoProducer: function (mediaRegistry) {
    return this.isVideoMediaClient(mediaRegistry) && mediaRegistry.mediaProperty.mediaRole === 'producer';
  },
  isVideoConsumer: function (mediaRegistry) {
    return this.isVideoMediaClient(mediaRegistry) && mediaRegistry.mediaProperty.mediaRole === 'consumer';
  },
  findMediaProducerClient: function (mediaRegistry) {
    for (let [key, value] of this.registry) {
      if (this.isVideoProducer(value) && mediaRegistry.mediaProperty.mediaChannel === value.mediaProperty.mediaChannel) {
        return value;
      }
    }
    console.log("no media producer for:" + mediaRegistry.mediaProperty.mediaChannel);
    return null;

  },
  findMediaConsumerClients: function (mediaRegistry) {
    const mediaConsumers = [];
    for (let [key, value] of this.registry) {
      if (this.isVideoConsumer(value) && mediaRegistry.mediaChannel === value.mediaChannel) {
        mediaConsumers.push(value);
      }
    }
    return mediaConsumers;
  },
  onMediaClientClose: function (registerItem) {
    if (!registerItem.mediaProperty) {
      return;
    }
    try {
      const producer = this.findMediaProducerClient(registerItem);
      if (producer) {
        registerItem.socket.to(producer.socket.id).emit("video/receiver/disconnected", registerItem.socket.id);
      }

    }
    catch (error) {
      this.processError(error, " onMediaClientClose:" + error);
    }
  },
  initResisterMediaClient: function (registerItem) {
    if ((!this.isVideoConsumer(registerItem)) && (!this.isVideoProducer(registerItem))) {
      return;
    }
    winstonLogger.log('info', "****a new media client is registered", { mediaProperty: registerItem.mediaProperty })
    var that = this;
    this.isVideoProducer(registerItem) && registerItem.socket.on("video/video-ready", () => {
      try {
        const mediaConsumers = that.findMediaConsumerClients(registerItem);
        mediaConsumers.forEach(consumer => {
          consumer.socket.emit('video/video-ready');
        });
      }
      catch (error) {
        that.processError(error, " failed to process video/video-read " + error);
      }
    });

    this.isVideoConsumer(registerItem) && registerItem.socket.on("video/watch", () => {
      const producer = that.findMediaProducerClient(registerItem);
      if (producer) {
        registerItem.socket.to(producer.socket.id).emit("video/watch", registerItem.socket.id);
      }


    });
    this.isVideoProducer(registerItem) && registerItem.socket.on("video/watchResponse", (id, message) => {
      registerItem.socket.to(id).emit("video/watchResponse", registerItem.socket.id, message);
    });
    this.isVideoConsumer(registerItem) && registerItem.socket.on("video/watching", (id, message) => {
      registerItem.socket.to(id).emit("video/watching", registerItem.socket.id, message);
    });
    registerItem.socket.on("video/candidate", (id, message) => {
      registerItem.socket.to(id).emit("video/candidate", registerItem.socket.id, message);
    });

  },

  getApplicationByApikey: function (apikey) {
    var matched = this.config.applications.filter((app) => app.apikey === apikey);
    if (matched.length === 0) {
      return null;
    }
    else {
      return matched[0];
    }
  },

  onConnect: function (socket) {
    winstonLogger.log('info', " a socket connected", { id: socket.id });


    socket.on("disconnect", function () {
      winstonLogger.log('info', " a socket disconnected", { id: socket.id });

    });
    var that = this;
    var disconnectTimeout = setTimeout(function () {
      winstonLogger.log('info', "disconnected the socket because of the timeout", { id: socket.id });
      socket.disconnect(true);
    }, 7000);
    var onRegister = function (registerMessage) {
      clearTimeout(disconnectTimeout);
      winstonLogger.log('info', "register message is received");
      try {
        that.onRegister(socket, JSON.parse(registerMessage));
      }
      catch (error) {
        that.processError(error, " in registerSocket:" + error);
      }
      socket.removeAllListeners("register");
    };
    socket.on("register", onRegister);
    const registerPermissionMessage = {
      result: "ok"
    }
    socket.emit("registerPermission", JSON.stringify(registerPermissionMessage));
  },
  sendFailedRegisterMessage: function (socket, request, errorMessage) {
    try {
      winstonLogger.log('info', errorMessage);
      var registeredMessage = {
        result: "failed",
        reason: errorMessage
      }
      socket.emit("registered", JSON.stringify(registeredMessage));
      socket.disconnect(true);

    }
    catch (error) {
      winstonLogger.log('error', "failed to send register-denied message", { error });
    }
  },
  onRegister: function (socket, request) {

    var matchedApplication = this.getApplicationByApikey(request.apikey);
    if (!matchedApplication) {
      clientInfoLogger(request, "api key is not valid:" + request.apikey);
      this.sendFailedRegisterMessage(socket, request, "apikey is not valid");
      return false;
    }
    var matchedNode = this.config.node.accept.filter(m => m === matchedApplication.name);

    if (matchedNode.length === 0) {
      this.sendFailedRegisterMessage(socket, request, "application name is not in the accept list");
      return false;
    }
    else {
      clientInfoLogger(request, "client application connected", { matchedApplication });


    }



    var that = this;
    const registerItem = {
      socket: socket,
      apikey: request.apikey,
      securityGroup: request.securityGroup,
      session: request.session,
      client: request.client,
      time: new Date(),
      mediaProperty: that.parseMediaClientId(request.client)
    };
    this.registry.set(registerItem.session, registerItem);
    socket.on("disconnect", function () {
      that.onMediaClientClose(registerItem);
      that.registry.delete(registerItem.session);
      clientInfoLogger(request, "removed from the registry", { session: registerItem.session, size: that.registry.size });
    });
    clientInfoLogger(request, "registered", { session: registerItem.session, size: this.registry.size });
    socket.on("inputPermision", function (data) {
      try {
        that.onInputPermission(registerItem, JSON.parse(data));
      }
      catch (error) {

        winstonLogger.log('error', "error processing the input Permission message" + error);
        clientInfoLogger(request, "error processing the input Permission message" + error);
        that.processError(error, " in requestJoin");
      }
      socket.removeAllListeners("inputPermision");
    });
    that.initResisterMediaClient(registerItem);
    var registeredMessage = {
      result: "ok",
      registeredInfo:{
        session: registerItem.session
      }
    }
    clientInfoLogger(request, "registered message is sent");
    socket.emit("registered", JSON.stringify(registeredMessage));
  },
  onInputPermission: function (registerItem, inputPermissionMessage) {

    if (registerItem.client !== inputPermissionMessage.client) {
      clientInfoLogger(inputPermissionMessage, "wrong client value", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Wrong client value");
      return;
    }
    if (registerItem.session !== inputPermissionMessage.session) {

      clientInfoLogger(inputPermissionMessage, "wrong session value", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Wrong session value");
      return;
    }
    if (!inputPermissionMessage.connectSession) {
      clientInfoLogger(inputPermissionMessage, "input permission message missing connectSession");


      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Missing connectSession value");
      return;
    }
    const receiver = this.registry.get(inputPermissionMessage.connectSession);
    if (receiver == null) {
      clientInfoLogger(inputPermissionMessage, "The session does not exist", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "The session does not exist");
      return;
    }
    if (receiver.securityGroup !== inputPermissionMessage.securityGroup) {
      clientInfoLogger(inputPermissionMessage, "The  app needs paring", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "The Security Group Key value mismatch.");
      return;
    };
    clientInfoLogger(inputPermissionMessage, "the input Permission received from:");

    var that = this;
    var onInputPermissionResult = function (data) {
      clientInfoLogger(inputPermissionMessage, "inputPermissionResult is received");


      try {
        that.onInputPermissionResult(registerItem, inputPermissionMessage, receiver, JSON.parse(data));
      }
      catch (error) {
        clientInfoLogger(inputPermissionMessage, error + " in  processJoinRequestResult");
        that.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, error);
      }
      receiver.socket.removeListener(receiver.session + "/inputPermissionResult", onInputPermissionResult);
    };
    receiver.socket.on(receiver.session + "/inputPermissionResult", onInputPermissionResult);
    clientInfoLogger(inputPermissionMessage, "sending inputPermission message");
    receiver.socket.emit(receiver.session + "/inputPermission", JSON.stringify(inputPermissionMessage));
  },

  onInputPermissionResult: function (registerItem, inputPermissionMessage, receiver, inputPermissionResult) {
    if (!inputPermissionResult.allow) {
      clientInfoLogger(inputPermissionMessage, "sending not refused inputPermission message");
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "client refused:" + inputPermissionResult.reason);
      return;
    }
    const inputMessageListener = function (inputMessage) {

      clientInfoLogger(inputPermissionMessage, "forwarding the input message");
      receiver.socket.emit(receiver.session + "/input", inputMessage);
    };
    const reverseInputMessageListener = function (inputMessage) {

      clientInfoLogger(inputPermissionMessage, "forwarding the reverse input message");

      registerItem.socket.emit(receiver.session + "/input", inputMessage);
    }
    const outputMessageListener = function (outputMessage) {

      clientInfoLogger(inputPermissionMessage, "forwarding the output message");
      registerItem.socket.emit(receiver.session + "/output", outputMessage);
    }

    registerItem.socket.on(receiver.session + "/input", inputMessageListener);
    receiver.socket.on(receiver.session + "/input", reverseInputMessageListener);
    receiver.socket.on(receiver.session + "/output", outputMessageListener);
    receiver.socket.on("disconnect", function () {
      registerItem.socket.removeListener(receiver.session + "/input", inputMessageListener);
      inputPermissionMessage.allow = false;
      inputPermissionMessage.reason = "received disconnected";
      registerItem.socket.emit(receiver.session + "/leave", JSON.stringify(inputPermissionMessage));
      clientInfoLogger(inputPermissionMessage, "inputMessage messageListener is removed");

    });
    registerItem.socket.on("disconnect", function () {
      receiver.socket.removeListener(receiver.session + "/input", reverseInputMessageListener);
      receiver.socket.removeListener(receiver.session + "/output", outputMessageListener);
      receiver.socket.emit(receiver.session + "/leave", JSON.stringify(inputPermissionMessage));

      clientInfoLogger(inputPermissionMessage, "reverse inputMessage messageListener is removed");


    });
    this.sendSuccessInputPermissionResult(registerItem, receiver, inputPermissionResult);
  },
  sendSuccessInputPermissionResult(registerItem, receiver, inputPermissionResult) {
    registerItem.socket.emit(receiver.session + "/inputPermissionResult", JSON.stringify(inputPermissionResult));
  },
  sendErrorInputPermissionResult(registerItem, inputPermissionMessage, reason) {
    inputPermissionMessage.allow = false;
    inputPermissionMessage.reason = reason;
    registerItem.socket.emit(inputPermissionMessage.connectSession + "/inputPermissionResult", JSON.stringify(inputPermissionMessage));
    clientInfoLogger(inputPermissionMessage, "input Permisson is not allowed:" + reason);
  },
  loadIndexFile: function (req, res) {
    res.sendFile(__dirname + "/default.html");
  }

};





module.exports = globalInputMessenger;
