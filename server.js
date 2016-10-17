

"use strict"

const Castles = require('./castles.js');
const castles = Castles.castles; 

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const entityInfoFile = require('./entityInfo.js');
const entityInfo = entityInfoFile.entityInfo;

const castleRadius = 2500;
let playerCastles = {};

function setPlayerEntityAtCastle(e, playerCastles){

	var rx = castleRadius / 2.5;
	var ry = castleRadius / 3;
	for(var c in castles){
		//Within the ellipse http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
		if(e.playerId != -1 && Math.pow((e.x - castles[c].x), 2) / Math.pow(rx , 2) + Math.pow((e.y - castles[c].y), 2) / Math.pow(ry, 2) < 1){
			if(!playerCastles[e.playerId]){
				playerCastles[e.playerId] = {};
			}if(!playerCastles[e.playerId].castles){
				playerCastles[e.playerId].castles = {};
			}
			if(!playerCastles[e.playerId].castles[c]){
				playerCastles[e.playerId].castles[c] = []
			}
			playerCastles[e.playerId].castles[c].push(e.id);
		
		}
	
	}

}

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
var levelWidthTiles = 1000;
var levelHeightTiles = 1000;
var levelWidthPixels = 1000 * 32;
var levelHeightPixels = 1000 * 32;
var changes = {};

var request = require('request');
//Lets try to make a HTTP GET request to modulus.io's website.
function getPath(startX, startY, endX, endY, id){
	startX = ~~startX;
	startY = ~~startY;
	endX = ~~endX;
	endY = ~~endY;

	request('https://aiserve.herokuapp.com/path?startX=' + startX + '&startY=' + startY +'&endX=' + endX + '&endY=' + endY, function (error, response, body) {
	    /*console.log(error);
	    console.log(response);*/
	    if (!error && response.statusCode == 200) {
	    	
	    	//console.log(body);
	        var pathResult = JSON.parse(body);
			if(pathResult.length > 0){
				addPath({id: id, heading: {x: nextX, y: nextY}, path: pathResult });	
			}
	    }else return;
	});
}


 function addPath(data){
  	change = true;
	if(allEntities[data.id]){
		allEntities[data.id].path = data.path;
		allEntities[data.id].heading = data.heading;
		allEntities[data.id].attacking = false;
	}else console.log(data.id + '. No such entity');
	
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
		addPath(data);
  });
			
			
	socket.on('attacks', (data) => {
	 change = true;
	 attacks.push(data.attacks);
  });

	
	socket.on('addEntity', (data) => {
		change = true;
    if(playerInfo[convertId(socket.id)].gold >= entityInfo[data.entity.type].cost){

        playerInfo[convertId(socket.id)].gold -= entityInfo[data.entity.type].cost;
        playerInfoChange = true;
        //console.log(playerInfo[convertId(socket.id)].gold);


		allEntities[data.entity.id] = data.entity;
		changes[data.entity.id] = data.entity;

	}

  });

  
		   
});
var aiEnt = {"attackType":"none","color":"#808080","playerId":"-1","type":"quarry","x":300,"y":487,"health":100,"directionPointing":"S","heading":{"x":292,"y":487},"attacking":false,"walking":false,"walkingState":0,"size":70,"height":70,"width":70,"loaded":true,"team":"red","ai":false,"selected":false,"path":[],"id":1475712082519,"nextNode":null}
var quar = JSON.stringify(aiEnt);


var hydraId; // just for testing
for(var i = 0; i < 500; i++){

	var newQuar = JSON.parse(quar);
	newQuar.x = ~~(Math.random() * levelWidthPixels);
	newQuar.y = ~~(Math.random() * levelHeightPixels);
	while(blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]){
		newQuar.x = ~~(Math.random() * levelWidthPixels);
		newQuar.y = ~~(Math.random() * levelHeightPixels);
	}
	newQuar.heading.x = newQuar.x;
	newQuar.heading.y = newQuar.y;

	newQuar.id = Date.now() + i * 200;
	allEntities[newQuar.id] = newQuar;


}

aiEnt.type = 'hydra';
aiEnt.height = 175;
aiEnt.width = 220;
quar = JSON.stringify(aiEnt);

for(var i = 0; i < 100; i++){

	var newQuar = JSON.parse(quar);
	newQuar.x = ~~(Math.random() * levelWidthPixels);
	newQuar.y = ~~(Math.random() * levelHeightPixels);
	while(blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]){
		newQuar.x = ~~(Math.random() * levelWidthPixels);
		newQuar.y = ~~(Math.random() * levelHeightPixels);
	}
	newQuar.heading.x = newQuar.x;
	newQuar.heading.y = newQuar.y;

	newQuar.id = Date.now() + i * 200;
	allEntities[newQuar.id] = newQuar;


	
	hydraId = newQuar.id; //just for testing

var nextX = ~~(Math.random() * 200) + newQuar.x / 2; //200 pixels around the current
	var nextY = ~~(Math.random() * 200) + newQuar.y / 2;
	while(blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]){
	    nextX = ~~(Math.random() * 200) + newQuar.x / 2; //200 pixels around the current
	    nextY = ~~(Math.random() * 200) + newQuar.y / 2;
	}

	getPath(allEntities[hydraId].x, allEntities[hydraId].y, nextX, nextY, hydraId);


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
	            allEntities[j].health -= entityInfo[allEntities[k].type].attack;
	            allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
	            setChange(j, 'health', allEntities[j].health)
	            if(allEntities[j].health <= 0){
	              allEntities[j].dead = true;
	              setChange(j, 'dead', true);
	              allEntities[j].walkingState = 2;
	              setChange(j, 'walkingState', 2);
	              playerInfo[attack.attacker.playerId].gold += entityInfo[allEntities[j].type].value;
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
	playerCastles = {};
    for(var e in entities){
    	
    	var entity = entities[e];
    	

		      

		  var wasWalking = entity.walking;

		  entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
		  if(entity.path && entity.path.length > 0){
			entity.walking = true;
			  if(!entity.nextNode){
				entity.nextNode = entity.path.pop();
				setChange(entity.id, 'nextNode', entity.nextNode)
			  }

		  };

		  if(wasWalking !== entity.walking){
			setChange(entity.id, 'walking', entity.walking)
			}


		if(entity.walking || wasWalking){
		  entity.attacking = false;
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
	 setPlayerEntityAtCastle(entity, playerCastles);
		
    }
	//console.log(JSON.stringify(playerCastles));
	return more;

	
}





