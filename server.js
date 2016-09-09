'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var allEntities = [];
var userEntities = {};

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('clientEntities', (entities) => {
  	userEntities[convertId(socket.id)] = entities;
  	io.emit('ping', 'client ' + convertId(socket.id) + ' just sent me something')
  })
});

setInterval(() => {
	allEntities = [];
	for(var userId in userEntities){
		allEntities = allEntites.concat(userEntities[userId]);
	}
	
	io.emit('time', allEntities)

}, 1000);

function convertId(oldId){
	return oldId.slice(2);
}
