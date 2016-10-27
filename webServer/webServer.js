"use strict"
var redis = require('redis');


//var client = require('redis').createClient('http://localhost:6379');
var castles = require('./castles.js').castles

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const attacksFile = require('./attacks.js');
const Attacks = attacksFile.Attacks;

const entityInfoFile = require('./entityInfo.js');
const entityInfo = entityInfoFile.entityInfo;




const express = require('express');

const socketIO = require('socket.io');
const path = require('path'); //What is this?
var request = require('request');

const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, '../public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const ioWorker = require('socket.io')(server, {
  path: '/socket.io-client'
});

ioWorker.set('transports', ['websocket']);

const io = socketIO(server);
const pathSocket = ioWorker.of('/path');


var tickRate = 30; // in hz

var change = true;
var changes = {};
var attacks = [];
var entities = {};

var playerInfo = {};
var playerInfoChange = false;

var lastAttacks = Date.now() + 500;
var lastFullState = 0;

var microMove = 4;  //How far each step for an entity is.  Could make entity specific

var pathSocketConnection;  //Used to get paths from aiServer
var clientSocketConnection;  //Used to talk with the client


const startGold = 10000;



var redisClient = redis.createClient(process.env.REDIS_URL);


/*******************aiServer Sockets ************************************/
pathSocket.on('connection', function(socket) {
    pathSocketConnection = socket;

    socket.on('path', (data) => {
        addPath(data);
    });
});



/*******************Client Sockets ************************************/
io.on('connection', (socket) => {
    if (!playerInfo[convertId(socket.id)]) {
        playerInfo[convertId(socket.id)] = {};
    }
    playerInfo[convertId(socket.id)].gold = startGold;
    redisClient.set('change', 'true');
    socket.on('entityPathRequest', (data) => {
        data.startX = entities[data.id].x;
        data.startY = entities[data.id].y;
        pathSocketConnection.emit('pathRequest', data);
    });
    socket.on('addEntity', (data) => {
        if (playerInfo[convertId(socket.id)].gold >= entityInfo[data.entity.type].cost) {
            playerInfo[convertId(socket.id)].gold -= entityInfo[data.entity.type].cost;
            playerInfoChange = true;
            setChange(data.entity.id, 'wholeEntity', data.entity)
            Attacks.setEntitiesMap(data.entity, true);
        }
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
});





/*******************Server Actions ************************************/



setInterval(() => {
    redisClient.get('change', function(err, outsideChange) {
        if (!err) {
            if (change || outsideChange === 'true') {
                change = mainServer(entities);
                if (!change) {
                    redisClient.set('change', 'false');
                }
            }
            if (Date.now() > lastAttacks + 1000) {
                commitAttacks(io);
            }
            if (Date.now() > lastFullState + 1000) {
                sendFullState(entities);
            }
            redisClient.set('entities', JSON.stringify(entities));
        } else {
            console.err(err);
        }
    });
}, 1000 / tickRate);


function commitAttacks(io) {
    clearAttacks(entities)
    doAttacks(entities); //has built in set redis for attacks
    castles.clearEntitiesInCastles();
    for (var e in entities) {
        castles.setEntitiesInCastles(entities[e]);
    }
    castles.setCastleColors(io);
}




function sendFullState(entities){
	
	    io.emit('allEntities', entities);
	    console.log('full state')
	    lastFullState = Date.now();
	

}

function doAttacks(entities){

      redisClient.get('attacks', function(err, attacks) {
        if (err) {
          console.err(err);
        }
        attacks = JSON.parse(attacks);
        //console.log(attacks);
        //console.log(attacks.length);
        if (attacks && attacks.length > 0) {
          var val = JSON.stringify([]);
          redisClient.set('attacks', val);
          applyAttacks(attacks, entities);
        }
      });
      lastAttacks = Date.now();
    
}
//make them walk and emit changes
function mainServer(entities){
    addAttacks(entities);


    var moreMoves = moveEntities(entities);


    //Send out changes to clients

    if (!(Object.keys(changes).length === 0 && changes.constructor === Object)) {
        io.emit('changes', changes);
        changes = {};
        redisClient.set('changes', JSON.stringify({}));

    }


    if (playerInfoChange) {
      io.emit('playerInfo', playerInfo);
      playerInfoChange = false;
    }
    return moreMoves;

  
  
}


/******************Function Definition ************************************/

function addAttacks(entities) {
    var attacks = [];
    for (var entity in entities) {
        var attack = Attacks.attackableEntities(entities[entity], entities);
        if (attack.length > 0 && attack.attacker && attack.attacker.length() > 0 && attack.victim && attack.victim.length() > 0) {
            attacks.push(attack);
        }
    }
    redisClient.set('attacks', JSON.stringify(attacks));
}









function addPath(data) {

    setChange(data.id, 'path', data.path);
    setChange(data.id, 'heading', data.heading);
    setChange(data.id, 'attacking', false);


}


function clearAttacks(entities) {
  for (var e in entities) {
    entities[e].attacking = false; // clear attacks
  }
}


function setChange(entityId, key, value) {
    if (key === 'wholeEntity') {
        entities[entityId] = value;
        changes[entityId] = value;
    } else {
        entities[entityId][key] = value;
        if (!changes[entityId]) {
            changes[entityId] = {};
        }
        changes[entityId][key] = value;
    }
    change = true;
}



function applyAttacks(attacks, allEntities) {
  //make this faster by indexing entities by id
  //check to make sure attack is ok
  //customize attacks for different kinds of entities
  //check if health = 0 and set dead.

  var attackList;
  //console.log('attacks in applyAttacks', attacks)
  while (attackList = attacks.shift()) {
    for (var a in attackList) {
      var attack = attackList[a];
      /*console.log(attackList[a]);
      console.log('***************************')*/

      var j = attack.victim.id;
      var k = attack.attacker.id;
      var attacking = false;
      if (allEntities[j] && allEntities[k]) {


        if (allEntities[j].health > 0) {
          attacking = true;
          allEntities[k].victim = j;
          setChange(k, 'victim', j);
          allEntities[j].health -= entityInfo[allEntities[k].type].attack;
          allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
          setChange(j, 'health', allEntities[j].health)

        }else{
        	Attacks.removeFromEntityMap(allEntities[j].x, allEntities[j].y, allEntities[j].id)
            allEntities[j].dead = true;
            setChange(j, 'dead', true);
            allEntities[j].walkingState = 2;
            setChange(j, 'walkingState', 2);
            playerInfo[attack.attacker.playerId].gold += entityInfo[allEntities[j].type].value;
            playerInfoChange = true;
        }

        allEntities[k].attacking = attacking;

      }

    }
  }
}

function convertId(oldId) {
  return oldId.slice(2);
}


function moveEntities(entities) {
	//NextNode is actually the current node, but called nextNode because currentNode should be derived from x, y
	//Previous node is the previous node
  var finalPixelFromHeading = 6;

  var more = false;  //If there are still entities walking after the move, several other ways to do this, like an array of walkers

  //console.log(entities.length);
  //playerCastles = {};

  for (var e in entities) {

    var entity = entities[e];

    var wasWalking = entity.walking;

    entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
    if (entity.path && entity.path.length > 0) {
    	//if entitiy has a path
      entity.walking = true;
      if (!entity.nextNode) {
        entity.nextNode = entity.path.pop();
        entity.previousNode = {};
        entity.previousNode.x = entity.nextNode.x;
        entity.previousNode.y = entity.nextNode.y;
        setChange(entity.id, 'nextNode', entity.nextNode);
        setChange(entity.id, 'previousNode', entity.previousNode);

      }

    };

    if (wasWalking !== entity.walking) {
    	//if entity has just started or just stopped walking
      setChange(entity.id, 'walking', entity.walking)
    }
    var entityHasPath = entity.path && entity.path.length > 0 ;


    if (entity.walking || wasWalking) {
    	//if entity is walking or just stopped walking
      entity.attacking = false;
      more = true;
      if (!entity.nextNode) {
      	//if next node hasn't been set, it is set to the current one?
      	//Attacks.setEntitiesMap(entity)

        entity.nextNode = {
          x: ~~(entity.x / 32),
          y: ~~(entity.y / 32)
        };
        setChange(entity.id, 'nextNode', entity.nextNode)
      } else if (entityHasPath && (entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32))) {
      	//if entity has a path and entity is not on next node yet
      	//then move it closer to nextNode
        if (~~(entity.x / 32) > entity.nextNode.x) {
          entity.x -= microMove;
        } else if (~~(entity.x / 32) < entity.nextNode.x) {
          entity.x += microMove;
        }
        if (~~(entity.y / 32) > entity.nextNode.y) {
          entity.y -= microMove;
        } else if (~~(entity.y / 32) < entity.nextNode.y) {
          entity.y += microMove;
        }

        setChange(entity.id, 'x', entity.x);
        setChange(entity.id, 'y', entity.y);

      } else if (entityHasPath) {
      	//if entity has path and already is on next node

      	Attacks.setEntitiesMap(entity)

        entity.previousNode = {};
        entity.previousNode.x = entity.nextNode.x;
        entity.previousNode.y = entity.nextNode.y;
        entity.nextNode = entity.path.pop();
        setChange(entity.id, 'nextNode', entity.nextNode);
        setChange(entity.id, 'previousNode', entity.previousNode);

      } else if (Math.abs(entity.heading.x - entity.x) > finalPixelFromHeading || Math.abs(entity.heading.y - entity.y) > finalPixelFromHeading) {
      	//if entity doens't have a path and is not cloes enough to heading;
        var xTooBig = Math.abs(entity.heading.x - entity.x) > finalPixelFromHeading;
        var yTooBig = Math.abs(entity.heading.y - entity.y) > finalPixelFromHeading;
        if (xTooBig && entity.x > entity.heading.x) {
          entity.x -= microMove;
        } else if (xTooBig && entity.x < entity.heading.x) {
          entity.x += microMove;
        }
        if (yTooBig && entity.y > entity.heading.y) {
          entity.y -= microMove;
        } else if (yTooBig && entity.y < entity.heading.y) {
          entity.y += microMove;
        }
        setChange(entity.id, 'x', entity.x);
        setChange(entity.id, 'y', entity.y);


        if (~~(entity.x / 32) !== entity.nextNode.x || ~~(entity.y / 32) !== entity.nextNode.y) {



          

          setChange(entity.id, 'nextNode', { //what does this do?
            x: ~~(entity.x / 32),
            y: ~~(entity.y / 32)
          });


        }else{

        	//if we have moved onto nextNode
        	Attacks.setEntitiesMap(entity)
          if(!entity.previousNode){
            entity.previousNode = {};
          }
        	entity.previousNode.x = entity.nextNode.x;
        	entity.previousNode.y = entity.nextNode.y;
        	entity.nextNode.x = ~~(entity.x / 32);
        	entity.nextNode.y = ~~(entity.y / 32)
        }

      }

    }
    //setPlayerEntityAtCastle(entity, playerCastles);



  }
  return more;

}




function addAICharacters() {
  var aiEnt = {
    "attackType": "none",
    "color": "#808080",
    "playerId": "-1",
    "type": "quarry",
    "x": 300,
    "y": 487,
    "health": 100,
    "directionPointing": "S",
    "heading": {
      "x": 292,
      "y": 487
    },
    "attacking": false,
    "walking": false,
    "walkingState": 0,
    "size": 70,
    "height": 70,
    "width": 70,
    "loaded": true,
    "team": "red",
    "ai": false,
    "selected": false,
    "path": [],
    "id": 1475712082519,
    "nextNode": null
  }
  var quar = JSON.stringify(aiEnt);

  var hydraId; // just for testing
  for (var i = 0; i < 500; i++) {

    var newQuar = JSON.parse(quar);
    newQuar.x = ~~(Math.random() * levelWidthPixels);
    newQuar.y = ~~(Math.random() * levelHeightPixels);
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
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

  for (var i = 0; i < 100; i++) {

    var newQuar = JSON.parse(quar);
    newQuar.x = ~~(Math.random() * levelWidthPixels);
    newQuar.y = ~~(Math.random() * levelHeightPixels);
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
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
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
      nextX = ~~(Math.random() * 200) + newQuar.x / 2; //200 pixels around the current
      nextY = ~~(Math.random() * 200) + newQuar.y / 2;
    }

    getPath(allEntities[hydraId].x, allEntities[hydraId].y, nextX, nextY, hydraId);

  }

}


