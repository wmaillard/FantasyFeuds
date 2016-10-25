"use strict"
var redis = require('redis');


//var client = require('redis').createClient('http://localhost:6379');
const Castles = require('./castles.js');
const castles = Castles.castles;

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const attacksFile = require('./attacks.js');
const Attacks = attacksFile.Attacks;

const entityInfoFile = require('./entityInfo.js');
const entityInfo = entityInfoFile.entityInfo;


const castleRadius = 2500;
let playerCastles = {};

const express = require('express');

const socketIO = require('socket.io');
const path = require('path'); //What is this?
var request = require('request');

const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const ioWorker = require('socket.io')(server, {
  path: '/socket.io-client'
});

ioWorker.set('transports', ['websocket']);

const io = socketIO(server);
const pathSocket = ioWorker.of('/path');


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
var lastAttacks = Date.now();
var lastFullState = 0;
var i = 0;
var newString = 'hey';
var microMove = 4;

var pathSocketConnection;
var clientSocketConnection;



/*Trying cloudamqp
var q = 'tasks';

var url = process.env.CLOUDAMQP_URL || "amqp://localhost";
var open = require('amqplib').connect(url);

// Publisher
open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(q);
    ch.sendToQueue(q, new Buffer('something to do'));
  });
  return ok;
}).then(null, console.warn);*/



/********************Action Starts Here ************************/
/*******************Worker Sockets ************************************/
pathSocket.on('connection', function(socket){
	pathSocketConnection = socket;
  console.log('someone connected');
  //console.log(socket);
    var coords = {
    startX: 1501,
    startY: 1722,
    endX: 1256,
    endY: 1865,
    id: 123321
  }

  socket.on('yo', function(data){
		console.log('bbs');

	})
  socket.on('path', (data)=> {
    /*console.log('Got a path');
    console.log(data);*/
    addPath(data);
  });
  
	});



/*******************Client Sockets ************************************/
io.on('connection', (socket) => {
  //console.log('connected', socket);
  if (!playerInfo[convertId(socket.id)]) {
    playerInfo[convertId(socket.id)] = {};
  }
  playerInfo[convertId(socket.id)].gold = 10000;

  change = true;
  console.log('Client connected');

  lastFullState = Date.now() - 1000 * 10 + 500;

  socket.on('path', (data) => {
    console.log('path in socket', data);
  })
  socket.on('disconnect', () => console.log('Client disconnected'));

  socket.on('entityPathRequest', (data) => {
  	pathSocketConnection.emit('pathRequest', data);
  });

  socket.on('attacks', (data) => {
    change = true;
    attacks.push(data.attacks);
  });

  socket.on('addEntity', (data) => {
    change = true;
    if (playerInfo[convertId(socket.id)].gold >= entityInfo[data.entity.type].cost) {

      playerInfo[convertId(socket.id)].gold -= entityInfo[data.entity.type].cost;
      playerInfoChange = true;
      //console.log(playerInfo[convertId(socket.id)].gold);

      allEntities[data.entity.id] = data.entity;
      Attacks.setEntitiesMap(allEntities[data.entity.id], true);

      changes[data.entity.id] = data.entity;

    }

  });

});


/*******************Server Actions ************************************/
var redisClient = redis.createClient(process.env.REDIS_URL);

//addAICharacters();

setInterval(() => {


  if (change) {
    walkingSlowDown++;
    addAttacks();

    /*for(var i in playerInfo){
    	console.log(i + ': ' + playerInfo[i].gold + ' gold')
    }*/
    /*console.log(counter + '. ' +process.hrtime());
    counter++;*/
    change = false;

    /*console.log('User Entities: ');
    console.log(userEntities);*/

    //console.log(attacks);
    if (Date.now() > lastAttacks + 1000) {
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
          applyAttacks(attacks, allEntities);
        }
      });
      lastAttacks = Date.now();
    }else change = true; 




    var maybeChange = moveEntities(allEntities);
    if (!change) {
      change = maybeChange;
    }

    if (!(Object.keys(changes).length === 0 && changes.constructor === Object)) {
      io.emit('changes', changes);

    }
    changes = {};

    if (playerInfoChange) {
      io.emit('playerInfo', playerInfo);
      playerInfoChange = false;
    }

  }
  if (Date.now() > lastFullState + 1000) {
    io.emit('allEntities', allEntities);
    console.log('full state')
    lastFullState = Date.now();

  }

  if (walkingSlowDown > gapStep) {
    walkingSlowDown = 0;
  }

}, 1000 / tickRate);





/******************Function Definition ************************************/

function addAttacks(){
	var attacks = [];
	for (var entity in allEntities){
		var attack = Attacks.attackableEntities(allEntities[entity], allEntities);
		attacks.push(attack);
	}
	//console.log('************', attacks)
	redisClient.set('attacks', JSON.stringify(attacks));
}

function setPlayerEntityAtCastle(e, playerCastles) {

  var rx = castleRadius / 2.5;
  var ry = castleRadius / 3;
  for (var c in castles) {
    //Within the ellipse http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
    if (e.playerId != -1 && Math.pow((e.x - castles[c].x), 2) / Math.pow(rx, 2) + Math.pow((e.y - castles[c].y), 2) / Math.pow(ry, 2) < 1) {
      if (!playerCastles[e.playerId]) {
        playerCastles[e.playerId] = {};
      }
      if (!playerCastles[e.playerId].castles) {
        playerCastles[e.playerId].castles = {};
      }
      if (!playerCastles[e.playerId].castles[c]) {
        playerCastles[e.playerId].castles[c] = []
      }
      playerCastles[e.playerId].castles[c].push(e.id);

    }

  }

}

function getPath(startX, startY, endX, endY, id) {
  var coords = {
    startX: ~~startX,
    startY: ~~startY,
    endX: ~~endX,
    endY: ~~endY,
    id: id
  }
 // pathSocket.emit('pathRequest', coords);

  //request('https://aiserve.herokuapp.com/path?startX=' + startX + '&startY=' + startY + '&endX=' + endX + '&endY=' + endY, function(error, response, body) {
/*  var pub = redis.createClient(process.env.REDIS_URL); //type 'redis-server' in the file in mydocs
  var sub = redis.createClient(process.env.REDIS_URL); //type 'redis-server' in the file in mydocs

  pub.publish('requestPath', JSON.stringify(coords), function(err) {
    sub.subscribe('path' + id, function(err, reply) {
      sub.on("message", function(channel, message) {
        console.log("sub channel " + channel + ": " + message);
        if (channel === 'path' + id) {
          addPath({
            id: id,
            heading: {
              x: endX,
              y: endY
            },
            path: message
          });
          sub.unsubscribe();
          sub.quit();
          pub.quit();
        }
      });
    });
  })*/
}

function addPath(data) {
  change = true;
  if (allEntities[data.id]) {
    allEntities[data.id].path = data.path;
    allEntities[data.id].heading = data.heading;
    allEntities[data.id].attacking = false;
  } else console.log(data.id + '. No such entity');

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






function clearAttacks(entities) {
  for (var e in entities) {
    entities[e].attacking = false; // clear attacks
  }
}

function setChange(entityId, key, value) {
  change = true;
  redisClient.set('entities', JSON.stringify(allEntities));


  if (!changes[entityId]) {
    changes[entityId] = {};
  }
  changes[entityId][key] = value;
}

function applyAttacks(attacks, entities) {
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
  playerCastles = {};
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
    setPlayerEntityAtCastle(entity, playerCastles);

  }
  //console.log(JSON.stringify(playerCastles));
  return more;

}
