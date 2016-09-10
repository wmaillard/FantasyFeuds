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
	console.log('User Entities: ');
	console.log(userEntities);
	for(var userId in userEntities){
		allEntities = allEntities.concat(userEntities[userId]);
	}
	moveEntities(allEntities);
	
	io.emit('allEntities', allEntities)

}, 250);

function convertId(oldId){
	return oldId.slice(2);
}

function moveEntities(entities) {

    for(var entity in entities){
      entity = entities[entity];

        if(entity.walking === true){
          if(!entity.nextNode){
            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
            entity.walking = false;
          }else if(entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32)){
            if(~~(entity.x / 32) > entity.nextNode.x){
              entity.x -= 10;
            }else if (~~(entity.x / 32) < entity.nextNode.x){
              entity.x += 10;
            }
            if(~~(entity.y / 32) > entity.nextNode.y){
              entity.y -= 10;
            }else if(~~(entity.y / 32) < entity.nextNode.y){
              entity.y += 10
            }
          }else{

            entity.nextNode = entity.path.pop();

        }
      }
    }

}
  