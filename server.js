"use strict"
var redis = require('redis');


//var client = require('redis').createClient('http://localhost:6379');
const Castles = require('./castles.js');
const castles = Castles.castles;

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const entityInfoFile = require('./entityInfo.js');
const entityInfo = entityInfoFile.entityInfo;

const castleRadius = 2500;
let playerCastles = {};

const express = require('express');


const path = require('path'); //What is this?
var request = require('request');

const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const io = require('socket.io')(server, {
  path: '/socket.io-client'
});

io.set('transports', ['websocket']);
//const io = socketIO(server);
const pathSocket = io.of('/path');


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
    console.log('Got a path');
    console.log(data);
  });
  socket.emit('pathRequest', coords);
  
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

  socket.on('entityPath', (data) => {
    addPath(data);
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
      changes[data.entity.id] = data.entity;

    }

  });

});


/*******************Server Actions ************************************/

addAICharacters();

setInterval(() => {

  if (change) {
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

    if (attacks.length > 0) {
      applyAttacks(attacks, allEntities);

    }
    if (Date.now() > lastAttacks + 1000) {
      //console.log('clearing');

      lastAttacks = Date.now();

    } else {
      change = true;
    }

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
  while (attackList = attacks.shift()) {
    for (var a in attackList) {
      var attack = attackList[a];
      /*console.log(attackList[a]);
      console.log('***************************')*/

      var j = attack.victim.id;
      var k = attack.attacker.id;
      if (allEntities[j] && allEntities[k]) {

        allEntities[k].attacking = true;
        if (allEntities[j].health > 0) {
          allEntities[k].victim = j;
          setChange(k, 'victim', j);
          allEntities[j].health -= entityInfo[allEntities[k].type].attack;
          allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
          setChange(j, 'health', allEntities[j].health)
          if (allEntities[j].health <= 0) {
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

function convertId(oldId) {
  return oldId.slice(2);
}


function moveEntities(entities) {
  var more = false;

  //console.log(entities.length);
  playerCastles = {};
  for (var e in entities) {

    var entity = entities[e];

    var wasWalking = entity.walking;

    entity.walking = (entity.nextNode && (Math.abs(entity.heading.x - entity.x) > 10 || Math.abs(entity.heading.y - entity.y) > 10));
    if (entity.path && entity.path.length > 0) {
      entity.walking = true;
      if (!entity.nextNode) {
        entity.nextNode = entity.path.pop();
        entity.previousNode = {};
        entity.previousNode.x = entity.nextNode.x;
        entity.previousNode.y = entity.nextNode.y;
        setChange(entity.id, 'nextNode', entity.nextNode);
        setChange(entity.id, 'previousNode', entity.previousNode)

      }

    };

    if (wasWalking !== entity.walking) {
      setChange(entity.id, 'walking', entity.walking)
    }

    if (entity.walking || wasWalking) {
      entity.attacking = false;
      more = true;
      if (!entity.nextNode) {
        entity.nextNode = {
          x: ~~(entity.x / 32),
          y: ~~(entity.y / 32)
        };
        setChange(entity.id, 'nextNode', entity.nextNode)
      } else if (entity.path && entity.path.length > 0 && (entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32))) {

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

      } else if (entity.path && entity.path.length > 0) {
        entity.previousNode = {};
        entity.previousNode.x = entity.nextNode.x;
        entity.previousNode.y = entity.nextNode.y;
        entity.nextNode = entity.path.pop();
        setChange(entity.id, 'nextNode', entity.nextNode);
        setChange(entity.id, 'previousNode', entity.previousNode)

      } else if (Math.abs(entity.heading.x - entity.x) > 6 || Math.abs(entity.heading.y - entity.y) > 6) {

        var xTooBig = Math.abs(entity.heading.x - entity.x) > 6;
        var yTooBig = Math.abs(entity.heading.y - entity.y) > 6;
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
          setChange(entity.id, 'nextNode', {
            x: ~~(entity.x / 32),
            y: ~~(entity.y / 32)
          });
        }

      }

    }
    setPlayerEntityAtCastle(entity, playerCastles);

  }
  //console.log(JSON.stringify(playerCastles));
  return more;

}
