var globalInputMessenger={
    sockets:[],
    io:{},
    loadIndexFile:function(req,res){
        console.log("------received test request----");
        res.sendFile(__dirname+"/index.html");  
    },
    logError:function(err, req, res, next){
        console.error(err.stack)
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