'use strict';


const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var tickRate = 30; // in hz, having trouble. Client sends [], server returns [], client sends [x] before getting[], client sends [] then [] is stored

var allEntities = [];
var userEntities = {};
var change = false;
var attacks = [];
var moveCount = 0;
var moveSpeed = 1;
var walkingSlowDown = 0; // tracker for gaps
var gapStep = 6; //gaps between steps;

io.on('connection', (socket) => {
	change = true;
  console.log('Client connected');
	
  socket.on('disconnect', () => console.log('Client disconnected'));
	
  socket.on('clientEntities', (data) => {
    return;
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
      entities[e].heading = data.heading;
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
//var counter = 0;
setInterval(() => {
	if(change){ 
    /*console.log(counter + '. ' +process.hrtime());
    counter++;*/
		change = false;
		allEntities = [];
		/*console.log('User Entities: ');
		console.log(userEntities);*/

		for(var userId in userEntities){
			allEntities = allEntities.concat(userEntities[userId]);
		}
		//console.log(attacks);
		applyAttacks(attacks, allEntities);

  
		change = moveEntities(allEntities);
		io.emit('allEntities', allEntities)

	}

}, 1000 / tickRate);


var entityStats = {
  'dwarfSoldier': {'attack': 10, 'cost' : 50},
  'elfFemale' : {'attack' : 12, 'cost' : 75},
  'humanSoldier' : {'attack' : 15, 'cost' : 120},
  'orcPeon' : {'attack' : 20, 'cost' : 150}
}
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
            entities[j].health -= entityStats[attack.attacker.type].attack;
            entities[j].health < 0 ? entities[j].health = 0 : null;
            if(!entities[j].health){
              entities[j].dead = true;
            }
			animateEntity(entities[j]); //animate victim
          }else if(entities[j].id === attack.attacker.id){
			  entities[j].attacking = true;
			  animateEntity(entities[j]); //animate attacker
		  }else{
			  entities[j].attacking = false; //set all others to false
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
  walkingSlowDown++;
    for(var entity in entities){
      entity = entities[entity];
      var wasWalking = entity.walking;




      entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
      if(entity.path.length > 0){
        entity.walking = true;
      };


        if(entity.walking || wasWalking){
          
		      animateEntity(entity);
	  	    setDirectionFacing(entity);
	 	       more = true;
          if(!entity.nextNode){
            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
          }else if(entity.path.length > 0 && (entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32))){

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
          }else if(entity.path.length > 0){
            entity.nextNode = entity.path.pop();

          }else if(Math.abs(entity.heading.x - entity.x) > 6 || Math.abs(entity.heading.y - entity.y) > 6){

            var xTooBig = Math.abs(entity.heading.x - entity.x) > 6;
            var yTooBig = Math.abs(entity.heading.y - entity.y) > 6;
            if(xTooBig && entity.x > entity.heading.x){
              entity.x -= microMove;
            }else if (xTooBig && entity.x < entity.heading.x){
              entity.x += microMove;
            }
            if(yTooBig && entity.y > entity.heading.y){
              entity.y -= microMove;
            }else if(yTooBig && entity.y < entity.heading.y){
              entity.y += microMove;
            }


          }
      }
    }
	return more;

}


function animateEntity(entity){
	if(entity.dead){
		entity.walkingState = 2;
		return;
	}
	if(entity.attacking && walkingSlowDown > gapStep){
		entity.walkingState === 0 ? entity.walkingState = 1 : entity.walkingState = 0;
		return;
	}
	
	
    if (entity.walking && walkingSlowDown > gapStep){  
          entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
          walkingSlowDown = 0;
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
