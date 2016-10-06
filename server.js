

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
var change = true;
var attacks = [];
var moveCount = 0;
var moveSpeed = 1;
var walkingSlowDown = 0; // tracker for gaps
var gapStep = 6; //gaps between steps;
var playerInfo = {};
var playerInfoChange = false;
var levelWidth = 1600;
var levelHeight = 2400;
var changes = {};

var entityStats = {
  'quarry': {'attack': 0, 'cost': 0, 'value': 100, 'object': true},
  'dwarfSoldier': {'attack': 10, 'cost' : 50, 'value' : 25},
  'elfFemale' : {'attack' : 12, 'cost' : 75, 'value' : 35},
  'humanSoldier' : {'attack' : 15, 'cost' : 120, 'value' : 60},
  'orcPeon' : {'attack' : 20, 'cost' : 150, 'value' : 75}
}

io.on('connection', (socket) => {
	if(!playerInfo[convertId(socket.id)]){
		playerInfo[convertId(socket.id)] = {};
	}
  playerInfo[convertId(socket.id)].gold = 200;

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
     		entities[e].attacking = false;
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
    if(playerInfo[convertId(socket.id)].gold >= entityStats[data.entity.type].cost){

        playerInfo[convertId(socket.id)].gold -= entityStats[data.entity.type].cost;
        playerInfoChange = true;
        //console.log(playerInfo[convertId(socket.id)].gold);


		if(!userEntities[convertId(socket.id)]){
			userEntities[convertId(socket.id)] = [];
		}
		userEntities[convertId(socket.id)].push(data.entity);
		changes[data.entity.id] = data.entity;

	}

  });

  
		   
});
var quar = {"attackType":"none","color":"#808080","playerId":"-1","type":"quarry","x":300,"y":487,"health":100,"directionPointing":"S","heading":{"x":292,"y":487},"attacking":false,"gore":{},"movedCount":0,"walking":true,"walkingState":0,"size":70,"height":70,"width":70,"loaded":true,"team":"red","ai":false,"selected":false,"fighting":false,"pathStart":{"x":0,"y":0},"dest":[],"pathDist":0,"path":[],"id":1475712082519,"nextNode":{"x":9,"y":15},"moved":false}
quar = JSON.stringify(quar);
userEntities[-1] = [];
for(var i = 0; i < 20; i++){

	var newQuar = JSON.parse(quar);
	newQuar.x = ~~(Math.random() * levelWidth);
	newQuar.y = ~~(Math.random() * levelHeight);
	newQuar.heading.x = newQuar.x;
	newQuar.heading.y = newQuar.y;
	newQuar.id = Date.now() + i * 200;
	userEntities[-1].push(newQuar);


}
//var counter = 0;
var lastAttacks = Date.now();
var lastFullState = Date.now();
setInterval(() => {



	if(change){ 
		  	walkingSlowDown++;

		/*for(var i in playerInfo){
			console.log(i + ': ' + playerInfo[i].gold + ' gold')
		}*/
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

		if(attacks.length > 0){
			applyAttacks(attacks, allEntities);
			
		}
		if(Date.now() > lastAttacks + 1000){
			//console.log('clearing');
		
			lastAttacks = Date.now();

		}else{
			change = true;
			for(var e in allEntities){
				if(allEntities[e].attacking){
					animateEntity(allEntities[e]);
				}
			}
			
		}



  
		var maybeChange = moveEntities(allEntities);
		if(!change){
			change = maybeChange;
		}


		if(changes.length > 0){
			io.emit('changes', changes);
		}
		changes = {};

		if(playerInfoChange){
			io.emit('playerInfo', playerInfo);
		}

	}
	if(lastFullState < Date.now() + 1000 * 60){
		io.emit('allEntities', allEntities);
	}

	if(walkingSlowDown > gapStep){ 
    		walkingSlowDown = 0;
   	}


}, 1000 / tickRate);


function clearAttacks(entities){
  for(var e in entities){
	entities[e].attacking = false; // clear attacks
  }
}
function setChange(entityId, key, value){
	if(!changes[entityId]){
		changes[entityId] = {};
	}
	changes[entityId][key] = value;
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
        for(var j in entities){ 
          if(entities[j].id === attack.victim.id && entities[j].health > 0){
            entities[j].health -= entityStats[attack.attacker.type].attack;
            entities[j].health < 0 ? entities[j].health = 0 : null;
            setChange(entities[j].id, 'health', entities[j].health)
            if(!entities[j].health){
              entities[j].dead = true;
              setChange(entities[j].id, 'dead', true)
              playerInfo[attack.attacker.playerId].gold += entityStats[entities[j].type].value;
              playerInfoChange = true;
            }
			animateEntity(entities[j]); //animate victim

          }else if(entities[j].id === attack.attacker.id){
			  entities[j].attacking = true;

			  animateEntity(entities[j]); //animate attacker
			  //change = true; // need to keep updating until attack list is empty
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

  	//console.log(entities.length);

    for(var e in entities){
    	
    	var entity = entities[e];
    	
    	if(entity.type === 'quarry' ){
		
    		if(!entity.dead){
	    		entity.walking = true;
	    		animateEntity(entity);
	    		more = true;
	    	}
    	}else{
		      

		      var wasWalking = entity.walking;

		      entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
		      if(entity.path.length > 0){
		        entity.walking = true;
		      };


	        if(entity.walking || wasWalking){
	          entity.attacking = false;
	          			  setChange(entity.id, 'attacking', false)
			      animateEntity(entity);
		  	    setDirectionFacing(entity);
		 	       more = true;
	          if(!entity.nextNode){
	            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
	            setChange(entity.id, 'nextNode', entity.nextNode)
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

	            setChange(entity.id, 'x', entity.x);
	            setChange(entity.id, 'y', entity.y);

	          }else if(entity.path.length > 0){
	            entity.nextNode = entity.path.pop();
	            setChange(entity.id, 'nextNode', entity.nextNode)


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
	            setChange(entity.id, 'x', entity.x);
	            setChange(entity.id, 'y', entity.y);

          	}
     	 }
		}
    }

	return more;

	
}


function animateEntity(entity){
	/*console.log(entity.id);
	console.log(entity.attacking);*/
	if(entity.dead){
		entity.walkingState = 2;
		setChange(entity.id, 'walkingState', entity.walkingState);
		return;
	}

	if(entity.attacking && walkingSlowDown > gapStep){
		
		entity.walkingState === 0 ? entity.walkingState = 1 : entity.walkingState = 0;
		return;
	}
	
    else if (entity.walking && walkingSlowDown > gapStep){  
          entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
          
    }
    else if(!entity.walking && !entity.attacking){  
        entity.walkingState = 1;  
    }
    setChange(entity.id, 'walkingState', entity.walkingState);
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



	setChange(entity.id, 'directionPointing', entity.directionPointing);
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
