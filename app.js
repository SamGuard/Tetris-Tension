const express = require('express');//Used for incoming http requests
const app = express();
const bodyparse = require("body-parser");



module.exports.rooms = [];

//Defining the local directory of the routes
const index = require('./routes/index');
const create = require("./routes/create");
const join = require("./routes/join");
const conn = require("./routes/passinfo");


app.use(bodyparse());
app.use(express.static("public"));

//Assigning directories to redirect the incoming request to
app.use("/",index);
app.use("/create-room", create.router);
app.use("/join-room",join);
app.use("/conn", conn);


//This deals with when a directory has not been found
app.use(function(req, res, next){
	res.send("<!DOCTYPE html><html>Directory not found!</html>");
});

 
module.exports = app;