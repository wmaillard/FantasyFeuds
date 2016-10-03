'use strict';


const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var tickRate = 60; // in hz, having trouble. Client sends [], server returns [], client sends [x] before getting[], client sends [] then [] is stored

var allEntities = [];
var userEntities = {};
var change = false;
var attacks = [];
var moveCount = 0;
var moveSpeed = 2;

io.on('connection', (socket) => {
	change = true;
  console.log('Client connected');
	
  socket.on('disconnect', () => console.log('Client disconnected'));
	
  socket.on('clientEntities', (data) => {
    var entities = data.entities;
    attacks.push(data.attacks);  

  	userEntities[convertId(socket.id)] = entities;
  	//console.log('client ' + convertId(socket.id) + ' just sent me something');
  	//io.emit('ping', 'client ' + convertId(socket.id) + ' just sent me something')
  })
  socket.on('entityPath', (data) => {
	  change = true;
	var entities = userEntities[convertId(socket.id)];
	for(var e in entities){
		if(data.id === entities[e].id){
			entities[e].path = data.path;
			break;
		}
  	}
  });
			
			
	socket.on('attacks', (data) => {
	change = true;
	 attacks.push(data.attacks);
  });
	
	socket.on('addEntity', (data) => {
		change = true;
		if(!userEntities[convertId(socket.id)]){
			userEntities[convertId(socket.id)] = [];
		   }
		   userEntities[convertId(socket.id)].push(data.entity);
	});
		   
});

setInterval(() => {
	if(change){  
		change = false;
		allEntities = [];
		/*console.log('User Entities: ');
		console.log(userEntities);*/

		for(var userId in userEntities){
			allEntities = allEntities.concat(userEntities[userId]);
		}
		//console.log(attacks);
		applyAttacks(attacks, allEntities);

		if(moveCount === moveSpeed){ //Silly thing to base entity movement off server speed, not very smart
		  moveCount = 0;   
		  change = moveEntities(allEntities);

		  io.emit('allEntities', allEntities)
		}else{
		  moveCount++;
		  change = true;
		}
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
var microMove = 4;
function moveEntities(entities) {
	var more = false;
    for(var entity in entities){
      entity = entities[entity];

        if(entity.path.length > 0 || (entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32))){
		animateEntity(entity);
	  	setDirectionFacing(entity);
	 	 more = true;
          if(!entity.nextNode){
            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
            entity.walking = false;
          }else if(entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32)){

            if(~~(entity.x / 32) > entity.nextNode.x){
              entity.x -= microMove;
            }else if (~~(entity.x / 32) < entity.nextNode.x){
              entity.x += microMove;
            }
            if(~~(entity.y / 32) > entity.nextNode.y){
              entity.y -= microMove;
            }else if(~~(entity.y / 32) < entity.nextNode.y){
              entity.y += microMove;
            }
          }else{
            entity.nextNode = entity.path.pop();

        }
      }
    }
	return more;

}


function animateEntity(entity){
    if(!entity.walkingSlowDown){
      entity.walkingSlowDown = 1;
    }else if(entity.walking){
      entity.walkingSlowDown++;
    }
    if (entity.walking && entity.walkingSlowDown === 3){  
          entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
          entity.walkingSlowDown = 0;
      }
    else if(!entity.walking){
        entity.walkingState = 1;  
    }
}

function setDirectionFacing(entity){
    var currentNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
	var nextNode = entity.nextNode;
	if(nextNode && nextNode.x !== currentNode.x || nextNode && nextNode.y !== currentNode.y){
		if(currentNode.x === nextNode.x){
			if(currentNode.y < nextNode.y){
				entity.directionPointing = 'S';
			}else{
				entity.directionPointing = 'N'
			}
		}else{
			if(currentNode.x < nextNode.x){
				entity.directionPointing = 'E'
			}else{
				entity.directionPointing = 'W';
			}
		}
	}
/* Keep this for a more fluid testing
	if(nextNode && nextNode.x !== currentNode.x && nextNode.y !== currentNode.y){

		var bPos = currentNode.y - currentNode.x;
		var bNeg = currentNode.y + currentNode.x;
		var yOnPos = nextNode.x + bPos;
		var yOnNeg = -nextNode.x + bNeg;
		if(nextNode.x < currentNode.x){
			if(nextNode.y < yOnPos && nextNode.y > yOnNeg){
				entity.directionPointing = 'W';
			}
			else if(nextNode.y < yOnNeg){
				entity.directionPointing = 'N';
			}
			else{
				entity.directionPointing = 'S'
			}
		}else{
			if(nextNode.y > yOnPos && nextNode.y < yOnNeg){
				entity.directionPointing = 'E';
			}			
			else if(nextNode.y < yOnPos){
				entity.directionPointing = 'N';
			}
			else{
				entity.directionPointing = 'S'
			}
		}
	}*/
}
