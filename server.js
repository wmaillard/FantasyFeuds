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
var change = false;
var attacks = [];

io.on('connection', (socket) => {
	change = true;
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('clientEntities', (data) => {
    var entities = data.entities;
    attacks = data.attacks;

    
  	change = true;
  	userEntities[convertId(socket.id)] = entities;
  	console.log('client ' + convertId(socket.id) + ' just sent me something');
  	//io.emit('ping', 'client ' + convertId(socket.id) + ' just sent me something')
  })
});

setInterval(() => {
	if(change){
		allEntities = [];
		/*console.log('User Entities: ');
		console.log(userEntities);*/

		for(var userId in userEntities){
			allEntities = allEntities.concat(userEntities[userId]);
		}
    applyAttacks(attacks, allEntities);

		moveEntities(allEntities);
		
		io.emit('allEntities', allEntities)
		change = false;
}

}, 250);

function applyAttacks(attacks, entities){
  //make this faster by indexing entities by id
  //check to make sure attack is ok
  //customize attacks for different kinds of entities
  //check if health = 0 and set dead.
  var attack;
  while(attack = attacks.pop()){
    for(var j in entities){
      if(entities[j].id === attack.victim.id){
        entities[j].health -= 20;
      }
    }
  }
}

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


  
