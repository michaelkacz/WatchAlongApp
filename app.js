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

// Store names and video ids for all rooms
const rooms = {};

const mp_namespaces = io.of(/^\/[a-z]{3}\-[a-z]{3}\-[a-z]{3}$/)
mp_namespaces.on('connection',function(socket){

  const namespaces = socket.nsp;

  if (!rooms[namespaces.name]) {
    rooms[namespaces.name] = {
      names: {},
      videoId: ''
    }
  }

  rooms[namespaces.name].names[socket.id] = socket.handshake.query.name;
  if (socket.handshake.query.videoId) {
    rooms[namespaces.name].videoId = socket.handshake.query.videoId;
  }

  const peers = [];
  // build a list for the connected-peer IDs using array
  for (let peer of namespaces.sockets.keys()){
    peers.push({ id: peer, name: rooms[namespaces.name].names[peer] });
  }
  // send the array to the connecting peer
  socket.emit('connected peers', { peers, videoId: rooms[namespaces.name].videoId });

  // send the connecting peer ID to all connected peers
  socket.broadcast.emit('connected peer', { id: socket.id, name: rooms[namespaces.name].names[socket.id] });

  // listen for signals
  socket.on('signal', function({to, ...rest}) {
    socket.to(to).emit('signal', {to, ...rest});
  });

  // listen for disconnects
  socket.on('disconnect', function(){
    // remove the name if the person diconnected
    delete rooms[namespaces.name].names[socket.id];
    if (!Object.keys(rooms[namespaces.name].names).length) {
      // clean up if no one in the room
      delete rooms[namespaces.name];
    }
    namespaces.emit('disconnected peer', socket.id);
  });
});
