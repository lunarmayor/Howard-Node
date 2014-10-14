process.title = 'pubsub-app';

var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var redis = require("redis");
port = process.env.PORT || 3001
server.listen(port);

// simple logger
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

io.sockets.on('connection', function (socket) {

  // subscribe to redis
  var subscribe = redis.createClient(10585, 'pub-redis-10585.us-east-1-1.2.ec2.garantiadata.com');
  subscribe.subscribe("howard");

  // relay redis messages to connected socket
  subscribe.on("message", function(channel, message) {
    console.log("from rails to subscriber:", channel, message);
    message = JSON.parse(message)
    socket.emit('message:' + message["phone"], message['note']);
  });

  // unsubscribe from redis if session disconnects
  socket.on('disconnect', function () {
    console.log("user disconnected");

    subscribe.quit();
  });

});
