var fs = require('fs');
const minimist = require('minimist');
const winston = require('winston');

var winstonlogger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ 'timestamp': true })
  ]
});

var clientinfologger = function (request, message, extrainfo) {
  if (request && request.client) {
    if (extrainfo) {
      winstonlogger.log('info', "client:" + request.client + ":" + message, extrainfo);
    }
    else {
      winstonlogger.log('info', "client:" + request.client + ":" + message);
    }

  }
  else {
    if (extrainfo) {
      winstonlogger.log('info', message, extrainfo);
    }
    else {
      winstonlogger.log('info', message);
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
      this.ionamespace = io.of(this.config.namespace);
    }
    else {
      this.ionamespace = io;
    }
    console.log("Copyright © 2017-2022 by Dilshat Hewzulla");
    this.ionamespace.on("connect", this.onConnect.bind(this));
  },
  processArguments: function (argv) {
    var pathToConfigFile = minimist(argv).config;
    console.log("********:" + pathToConfigFile);
    if (!pathToConfigFile) {
      this.configPath = "config/config.json";


    }
    else {
      this.configPath = pathToConfigFile;
    }
    winstonlogger.log('info', "using config file path", { configPath: this.configPath });
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
      winstonlogger.log('error', "config file does not exist", { configPath: configPath });
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
      winstonlogger.log('info', "apikey is empty");
      this.sockerServerDenied(req, res, "apikey is empty");
      return;
    }
    var application = this.getApplicationByApikey(apikey);
    if (application) {
      winstonlogger.log('info', "granted socket url ", { application });
      this.socketServerGranted(req, res, application);
    }
    else {
      winstonlogger.log('info', "denied socket url ", { apikey });
      this.sockerServerDenied(req, res, "apikey does not match");
    }


  },
  socketServerGranted: function (req, res, application) {
    res.writeHead(200, httpResponseHeader);
    var data = {
      result: "ok",
      url: application.url
    };
    res.end(JSON.stringify(data));
  },
  sockerServerDenied: function (req, res, reason) {
    res.writeHead(401, httpResponseHeader);
    var data = {
      result: "failed",
      reason
    };
    res.end(JSON.stringify(data));
  },

  logger: function (err, req, res, next) {
    winstonlogger.log('info', "request received");
    next(err)
  },
  processError: function (error, message) {
    winstonlogger.log('error', message, { error });
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
    winstonlogger.log('info', " a socket connected", { id: socket.id });


    socket.on("disconnect", function () {
      winstonlogger.log('info', " a socket disconnected", { id: socket.id });

    });
    var that = this;
    var disconnectTimeout = setTimeout(function () {
      winstonlogger.log('info', "disconnected the socket because of the timeout", { id: socket.id });
      socket.disconnect(true);
    }, 7000);
    var onRegister = function (registerMessage) {
      console.log("*******registerMessage:registerMessage:" + registerMessage);
      clearTimeout(disconnectTimeout);
      winstonlogger.log('info', "register message is received");
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
      winstonlogger.log('info', errorMessage);
      var registeredMessage = {
        result: "failed",
        reason: errorMessage
      }
      socket.emit("registered", JSON.stringify(registeredMessage));
      socket.disconnect(true);

    }
    catch (error) {
      winstonlogger.log('error', "failed to send register-denied message", { error });
    }
  },
  onRegister: function (socket, request) {

    var matchedApplication = this.getApplicationByApikey(request.apikey);
    if (!matchedApplication) {
      clientinfologger(request, "api key is not valid:" + request.apikey);
      this.sendFailedRegisterMessage(socket, request, "apikey is not valid");
      return false;
    }
    var matchedNode = this.config.node.accept.filter(m => m === matchedApplication.name);

    if (matchedNode.length === 0) {
      this.sendFailedRegisterMessage(socket, request, "wrong node");
      return false;
    }
    else {
      clientinfologger(request, "client application connected", { matchedApplication });


    }



    var that = this;
    const registerItem = {
      socket: socket,
      apikey: request.apikey,
      securityGroup: request.securityGroup,
      session: request.session,
      client: request.client,
      time: new Date()
    };
    this.registry.set(registerItem.session, registerItem);
    socket.on("disconnect", function () {
      that.registry.delete(registerItem.session);
      clientinfologger(request, "removed from the registry", { session: registerItem.session, size: that.registry.size });
    });
    clientinfologger(request, "registered", { session: registerItem.session, size: this.registry.size });

    socket.on("inputPermision", function (data) {
      try {
        that.onInputPermission(registerItem, JSON.parse(data));
      }
      catch (error) {

        winstonlogger.log('error', "error processing the inputPermision message" + error);
        clientinfologger(request, "error processing the inputPermision message" + error);
        that.processError(error, " in requestJoin");
      }
      socket.removeAllListeners("inputPermision");
    });
    var registeredMessage = {
      result: "ok",
    }
    clientinfologger(request, "registered message is sent");
    socket.emit("registered", JSON.stringify(registeredMessage));
  },
  onInputPermission: function (registerItem, inputPermissionMessage) {

    if (registerItem.client !== inputPermissionMessage.client) {
      clientinfologger(inputPermissionMessage, "wrong client value", { inputPermissionMessag });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Wrong client value");
      return;
    }
    if (registerItem.session !== inputPermissionMessage.session) {

      clientinfologger(inputPermissionMessage, "wrong session value", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Wrong session value");
      return;
    }
    if (!inputPermissionMessage.connectSession) {
      clientinfologger(inputPermissionMessage, "input permission message missing connectSession");


      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "Missing connectSession value");
      return;
    }
    const receiver = this.registry.get(inputPermissionMessage.connectSession);
    if (receiver == null) {
      clientinfologger(inputPermissionMessage, "The session does not exist", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "The session does not exist");
      return;
    }
    if (receiver.securityGroup !== inputPermissionMessage.securityGroup) {
      clientinfologger(inputPermissionMessage, "The  app needs paring", { inputPermissionMessage });
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "The Secruity Group Key value mismatch.");
      return;
    };
    clientinfologger(inputPermissionMessage, "the input Permission received from:");

    var that = this;
    var onInputPermissionResult = function (data) {
      clientinfologger(inputPermissionMessage, "inputPermissionResult is received");


      try {
        that.onInputPermissionResult(registerItem, inputPermissionMessage, receiver, JSON.parse(data));
      }
      catch (error) {
        clientinfologger(inputPermissionMessage, error + " in  processJoinRequestResult");
        that.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, error);
      }
      receiver.socket.removeListener(receiver.session + "/inputPermissionResult", onInputPermissionResult);
    };
    receiver.socket.on(receiver.session + "/inputPermissionResult", onInputPermissionResult);
    clientinfologger(inputPermissionMessage, "sending inputPermission message");
    receiver.socket.emit(receiver.session + "/inputPermission", JSON.stringify(inputPermissionMessage));
  },

  onInputPermissionResult: function (registerItem, inputPermissionMessage, receiver, inputPermissionResult) {
    if (!inputPermissionResult.allow) {
      clientinfologger(inputPermissionMessage, "sending not refused inputPermission message");
      this.sendErrorInputPermissionResult(registerItem, inputPermissionMessage, "client refused:" + inputPermissionResult.reason);
      return;
    }
    const inputMessageListener = function (inputMessage) {

      clientinfologger(inputPermissionMessage, "forwarding the input message");
      receiver.socket.emit(receiver.session + "/input", inputMessage);
    };
    const reverseInputMessageListener = function (inputMessage) {

      clientinfologger(inputPermissionMessage, "forwarding the reverse input message");

      registerItem.socket.emit(receiver.session + "/input", inputMessage);
    }
    const outputMessageListener = function (outputMessage) {

      clientinfologger(inputPermissionMessage, "forwarding the output message");
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
      clientinfologger(inputPermissionMessage, "inputMessage messageListener is removed");

    });
    registerItem.socket.on("disconnect", function () {
      receiver.socket.removeListener(receiver.session + "/input", reverseInputMessageListener);
      receiver.socket.removeListener(receiver.session + "/output", outputMessageListener);
      receiver.socket.emit(receiver.session + "/leave", JSON.stringify(inputPermissionMessage));

      clientinfologger(inputPermissionMessage, "reverse inputMessage messageListener is removed");


    });
    this.sendSucessInputPermissionResult(registerItem, receiver, inputPermissionResult);
  },
  sendSucessInputPermissionResult(registerItem, receiver, inputPermissionResult) {
    registerItem.socket.emit(receiver.session + "/inputPermissionResult", JSON.stringify(inputPermissionResult));
  },
  sendErrorInputPermissionResult(registerItem, inputPermissionMessage, reason) {
    inputPermissionMessage.allow = false;
    inputPermissionMessage.reason = reason;
    registerItem.socket.emit(inputPermissionMessage.connectSession + "/inputPermissionResult", JSON.stringify(inputPermissionMessage));
    clientinfologger(inputPermissionMessage, "input Permisson is not allowed:" + reason);
  }
};
module.exports = globalInputMessenger;
