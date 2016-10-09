

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var tickRate = 30; // in hz, having trouble. Client sends [], server returns [], client sends [x] before getting[], client sends [] then [] is stored

var allEntities = {};
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
  playerInfo[convertId(socket.id)].gold = 10000;

	change = true;
  console.log('Client connected');


		lastFullState = Date.now() - 1000 * 10 + 500;
	
  socket.on('disconnect', () => console.log('Client disconnected'));
	
 /* socket.on('clientEntities', (data) => {
    return;
    var entities = data.entities;
    attacks.push(data.attacks);  

  	userEntities[convertId(socket.id)] = entities;
  	//console.log('client ' + convertId(socket.id) + ' just sent me something');
  	//io.emit('ping', 'client ' + convertId(socket.id) + ' just sent me something')
  })*/
  socket.on('entityPath', (data) => {
	change = true;
	if(allEntities[data.id]){
		allEntities[data.id].path = data.path;
		allEntities[data.id].heading = data.heading;
		allEntities[data.id].attacking = false;
	}else console.log(data.id + '. No such entity');
			
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


		allEntities[data.entity.id] = data.entity;
		changes[data.entity.id] = data.entity;

	}

  });

  
		   
});
var quar = {"attackType":"none","color":"#808080","playerId":"-1","type":"quarry","x":300,"y":487,"health":100,"directionPointing":"S","heading":{"x":292,"y":487},"attacking":false,"gore":{},"movedCount":0,"walking":true,"walkingState":0,"size":70,"height":70,"width":70,"loaded":true,"team":"red","ai":false,"selected":false,"fighting":false,"pathStart":{"x":0,"y":0},"dest":[],"pathDist":0,"path":[],"id":1475712082519,"nextNode":{"x":9,"y":15},"moved":false}
quar = JSON.stringify(quar);

for(var i = 0; i < 20; i++){

	var newQuar = JSON.parse(quar);
	newQuar.x = ~~(Math.random() * levelWidth);
	newQuar.y = ~~(Math.random() * levelHeight);
	newQuar.heading.x = newQuar.x;
	newQuar.heading.y = newQuar.y;
	newQuar.nextNode.x = ~~(newQuar.x / 32)
	newQuar.nextNode.y = ~~(newQuar.y / 32)

	newQuar.id = Date.now() + i * 200;
	allEntities[newQuar.id] = newQuar;


}
//var counter = 0;
var lastAttacks = Date.now();
var lastFullState = 0;
setInterval(() => {



	if(change){ 
		  	walkingSlowDown++;

		/*for(var i in playerInfo){
			console.log(i + ': ' + playerInfo[i].gold + ' gold')
		}*/
    /*console.log(counter + '. ' +process.hrtime());
    counter++;*/
		change = false;

		/*console.log('User Entities: ');
		console.log(userEntities);*/


		//console.log(attacks);

		if(attacks.length > 0){
			applyAttacks(attacks, allEntities);
			
		}
		if(Date.now() > lastAttacks + 1000){
			//console.log('clearing');
		
			lastAttacks = Date.now();

		}else{
			change = true;
			/*for(var e in allEntities){
				if(allEntities[e].attacking){
					animateEntity(allEntities[e]);
				}
			}*/
			
		}



  
		var maybeChange = moveEntities(allEntities);
		if(!change){
			change = maybeChange;
		}


		if(!(Object.keys(changes).length === 0 && changes.constructor === Object)){
			io.emit('changes', changes);

		}
		changes = {};

		if(playerInfoChange){
			io.emit('playerInfo', playerInfo);
			playerInfoChange = false;
		}

	}
	if(Date.now() > lastFullState + 1000 * 10){
		io.emit('allEntities', allEntities);
		console.log('full state')
		lastFullState = Date.now();
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
    for(var a in attackList){
      var attack = attackList[a];
      /*console.log(attackList[a]);
      console.log('***************************')*/
      
        var j = attack.victim.id;
        var k = attack.attacker.id;
        if(allEntities[j] && allEntities[k]){

	        allEntities[k].attacking = true;
	        if(allEntities[j].health > 0){
	        	allEntities[k].victim = j;
	        	setChange(k, 'victim', j);
	            allEntities[j].health -= entityStats[allEntities[k].type].attack;
	            allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
	            setChange(j, 'health', allEntities[j].health)
	            if(allEntities[j].health <= 0){
	              allEntities[j].dead = true;
	              setChange(j, 'dead', true);
	              allEntities[j].walkingState = 2;
	              setChange(j, 'walkingState', 2);
	              playerInfo[attack.attacker.playerId].gold += entityStats[allEntities[j].type].value;
	              playerInfoChange = true;
	            }
				//animateEntity(entities[j]); //animate victim

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
    	

		      

		      var wasWalking = entity.walking;

		      entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
		      if(entity.path && entity.path.length > 0){
		        entity.walking = true;

		      };

		      if(wasWalking !== entity.walking){
		      	setChange(entity.id, 'walking', entity.walking)
		  		}


	        if(entity.walking || wasWalking){
	          entity.attacking = false;
	          	//setChange(entity.id, 'attacking', false)



			     // animateEntity(entity);
		  	    //setDirectionFacing(entity);
		 	       more = true;
	          if(!entity.nextNode){
	            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
	            setChange(entity.id, 'nextNode', entity.nextNode)
	          }else if(entity.path && entity.path.length > 0 && (entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32))){

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

	          }else if(entity.path && entity.path.length > 0){
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
	            if(~~(entity.x / 32) !== entity.nextNode.x || ~~(entity.y / 32) !== entity.nextNode.y){
	            	setChange(entity.id, 'nextNode', {x: ~~(entity.x / 32), y: ~~(entity.y / 32)});
	            }

          	}
     	 }
		
    }

	return more;

	
}





