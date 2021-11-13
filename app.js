var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const io = require('socket.io')();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = { app, io };

const mp_namespaces = io.of(/^\/[a-z]{3}\-[a-z]{3}\-[a-z]{3}$/)
mp_namespaces.on('connection',function(socket){

  const namespaces = socket.nsp;
  const peers = [];
  // build a list for the connected-peer IDs using array
  for (let peer of namespaces.sockets.keys()){
    peers.push(peer);
  }
  // send the array to the connecting peer
  socket.emit('connected peers', peers);

  // send the connecting peer ID to all connected peers
  socket.broadcast.emit('connected peer', socket.id);

  // listen for signals
  socket.on('signal', function({to, ...rest}) {
    socket.to(to).emit('signal', {to, ...rest})
  });

  // listen for disconnects
  socket.on('disconnect', function(){
    namespaces.emit('disconnected peer', socket.id);
  });
});
