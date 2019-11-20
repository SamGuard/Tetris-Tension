const http = require('http');//Loading http package so i can use a http server
const webSocketServer = require("websocket").server;
const app = require("./app");//Getting app.js in the current folder which holds all the routes the user can take
const ids = require("short-id");

const port = process.env.PORT || 3000;//This means to use port 3000 unless process.env.PORT is set as this variable is set when deployed to heroku

const server = http.createServer(app);//Creates the http server using app.js

server.listen(port);//Listen for incoming connections

console.log("listening on port " + port);

var saltCounter = 0;



clients = []
rooms = []

class room{
	constructor(pin,id1){
		this.pin = pin;
		this.id1 = id1;
		this.id2 = null;
		this.buffer = []
		this.interval;
	}

	send(data,id){
		if(id == 1){
			sendToClient(JSON.stringify(data),this.id1);
		}else{
			if(this.id2 != null){
				sendToClient(JSON.stringify(data),this.id1);
			}else{
				this.buffer.push(data);
			}
		}

	}

	sendBuffer(){
		if(this.id2 != null){
			console.log("sending buffer");
			clearInterval(this.interval)
			for(var i = 0; i < this.buffer.length; i++){
				//console.log(this.buffer[i]);
				sendToClient(JSON.stringify(this.buffer[i]),this.id2);
			}
		}
	}
		

}

function sendToClient(message,IP){
	for(var i = 0; i < clients.length; i++){
		if(clients[i].remoteAddress == IP){
			clients[i].sendUTF(message);
			console.log(`sent ${message}`);
		}
	}
}


var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info 
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});




wsServer.on('request', function(request) {
	var IP;

	console.log((new Date()) + ' Connection from origin '
    + request.remoteAddress + '.');

	var connection = request.accept(null, request.origin);
	clients.push(connection);
	IP = request.remoteAddress;

	for(var i = 0; i < clients.length; i++){
		console.log(clients[i].remoteAddress);
	}
	console.log((new Date()) + ' Connection accepted.');

	connection.on('message', function(message) {
		if(message.type === "utf8"){
			console.log("message: "+message.utf8Data);

			var data = JSON.parse(message.utf8Data);
			var index;

			if (data.purpose == "init"){
				//IP = data.IP;
				var pin = data.pin;
				var found = false;
				var json;

				if (pin == "-1"){
					ids.configure({
						length: 6,          // The length of the id strings to generate
						algorithm: 'sha1',  // The hashing algoritm to use in generating keys
						salt: saltCounter // A salt value or function
					});
					rooms.push(new room(ids.generate(),IP));
					rooms[rooms.length-1].interval = setInterval(function(){rooms[rooms.length-1].sendBuffer()},10);
					saltCounter++;
					json = JSON.stringify({type:"message", purpose:"init", pin:rooms[rooms.length-1].pin, data:`Added to room, pin:${pin}, IP:${IP}`});
					console.log("created room");
				}else{

					for(var i = 0; i < rooms.length; i++){
						if (rooms[i].pin == pin){
							found = true;
							rooms[i].id2 = IP;
							index = i;
						}
					}
					if(found == true){
						json = JSON.stringify({type:"message", purpose:"init", pin:rooms[index].pin, data:`Room added pin:${pin}, IP:${IP}`});
					}else{
						json = 	JSON.stringify({type:"message", purpose:"init", pin:"-1", data:"not found"});
					}

				}

				sendToClient(json,IP);


			}else if(data.purpose === "pass"){
				var json = data;
				var found = false;
				console.log(IP);
				for(var i = 0; i < rooms.length; i++){
					console.log(rooms);
					if(rooms[i].id1 == IP){
						found = true;
						rooms[i].send(json,2);
						//console.log(`${json} sent to ${rooms[i].id2}`);
					}else if(rooms[i].id2 == IP){
						found = true;
						rooms[i].send(json,1);
						//console.log(`${json} sent to ${rooms[i].id1}`);
					}
				}
				if(found = false){
					console.log("other computer not found");
				}


			}else if(data.purpose == "close"){
				console.log(`Closing room with IP ${IP}`);
		  		console.log(clients); 
		  		for(var i = 0; i < clients.length; i++){
		  			if (clients[i].remoteAddress == IP){
		  				client[i].close();
		  				if(i == 0){
		  					clients = clients.slice(1,clients.length);
		  				}else{
		  					clients.splice(i,1);
		  				}
		  			}
		  		}
			}else{
				console.log("unkown message");
			}
			
			
		}
	});


	connection.on('close', function(connection, closeReason, description) {
  		console.log(`Closing room with IP ${IP}`);
  		console.log(clients); 
  		for(var i = 0; i < clients.length; i++){
  			if (clients[i].remoteAddress == IP){
  				clients[i].close();
  				if(i == 0){
  					clients = clients.slice(1,clients.length);
  				}else{
  					clients.splice(i,1);
  				}
  			}
  		}
  		     
  	});

});