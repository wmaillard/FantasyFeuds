'use strict';


const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var tickRate = 60; // in hz

var allEntities = [];
var userEntities = {};
var change = false;
var attacks = [];
var moveCount = 0;
var moveSpeed = 1;

io.on('connection', (socket) => {
	change = true;
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('clientEntities', (data) => {
    var entities = data.entities;
    attacks.push(data.attacks);  

    
  	change = true;
  	userEntities[convertId(socket.id)] = entities;
  	//console.log('client ' + convertId(socket.id) + ' just sent me something');
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
    //console.log(attacks);
    applyAttacks(attacks, allEntities);

    if(moveCount === moveSpeed){
      moveCount = 0;   
      moveEntities(allEntities);
    }else{
      moveCount++;
		}
		io.emit('allEntities', allEntities)
		change = false;
}

}, 1000 / tickRate);

function applyAttacks(attacks, entities){
  //make this faster by indexing entities by id
  //check to make sure attack is ok
  //customize attacks for different kinds of entities
  //check if health = 0 and set dead.
  var attackList;
  while(attackList = attacks.shift()){
    for(var a in attackList)
      var attack = attackList[a];
      if(attack){
        for(var j in entities){ //change this to use userEntities?
          if(entities[j].id === attack.victim.id && entities[j].health > 0){
            entities[j].health -= 5;
            entities[j].health < 0 ? entities[j].health = 0 : null;
            if(!entities[j].health){
              entities[j].dead = true;
            }
          }
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


  
