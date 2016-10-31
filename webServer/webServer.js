"use strict"
var redis = require('redis');
var Castles = require('./castles.js').castles;
var castles = Castles.castles;
const blockingTerrain = require('./blockingTerrain.js').blockingTerrain;
const Attacks = require('./attacks.js').Attacks;
const entityInfo = require('./entityInfo.js').entityInfo;
const express = require('express');
const socketIO = require('socket.io');
const path = require('path'); 
const convertId = require('./generalUtilities.js').convertId;
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

var clientSocketConnection; //Used to talk with the client
var pathSocketConnection;
var playerInfo = {};
var playerInfoChange = false;
var tickRate = 30; // in hz
var changes = {};
var attacks = [];
var entities = {};

var lastAttacks = Date.now() + 500;
var lastFullState = Date.now() - 1001;

const startGold = 500;
var redisClient = redis.createClient(process.env.REDIS_URL);
var LOO = require('./generalUtilities').LOO;
var moveEntitiesFile = require('./moveEntities.js').moveEntities;
var moveEntities = moveEntitiesFile.moveEntities;
var lastScores = Date.now() - 10000;
var scores = {'orange': 1000, 'blue': 1000}
var blankGameLength = 20; //minutes
var pointsPerCastle = 1000 / 60 / 5 / blankGameLength;  //5 = num start castles, 1000 points 60 seconds
var nextPlayer = 'orange';
/************** Web Worker Sockets **********************/
pathSocket.on('connection', function(socket) {
    pathSocketConnection = socket;
    socket.on('path', (data) => {
        addPath(data);
    });
});

/*********** Client Sockets ************************/
io.on('connection', (socket) => {
    if (!playerInfo[convertId(socket.id)]) {
        playerInfo[convertId(socket.id)] = {};
    }
    playerInfo[convertId(socket.id)].gold = startGold;
    playerInfo[convertId(socket.id)].team = nextPlayer;
    io.emit('team', nextPlayer);
    if(nextPlayer === 'orange'){
    	nextPlayer = 'blue';
    }else{
    	nextPlayer = 'orange';
    }

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

runServer();
function clearPlayerInfo(playerInfo){
	for(var player in playerInfo){
		playerInfo[player].gold = startGold;
	}
}
function runServer(){

clearPlayerInfo(playerInfo);
	
 playerInfoChange = true;
 tickRate = 30; // in hz
 changes = {};
 attacks = [];
 entities = {};

 lastAttacks = Date.now() + 500;
 lastFullState = Date.now() - 1001;

 redisClient = redis.createClient(process.env.REDIS_URL);
 LOO = require('./generalUtilities').LOO;
 moveEntitiesFile = require('./moveEntities.js').moveEntities;
 moveEntities = moveEntitiesFile.moveEntities;
 lastScores = Date.now() - 10000;
 scores = {'orange': 1000, 'blue': 1000}
blankGameLength = 20; //minutes
pointsPerCastle = 1000 / 60 / 5 / blankGameLength;  //5 = num start castles, 1000 points 60 seconds
var castles = Castles.castles;


/*******************Main Server Loop ************************************/
var mainInterval = setInterval(() => {
    redisClient.get('changes', function(err, outsideChanges) {
        outsideChanges = JSON.stringify(outsideChanges);
        if (!err) {

            outsideChanges = JSON.stringify(outsideChanges);
            if(LOO(outsideChanges) > 0){
                Object.assign(changes, outsideChanges)  //Apply outside changes
                redisClient.set('changes', JSON.stringify({}));
            }

            Object.assign(changes, moveEntities(entities)); //Move entities

            if (LOO(changes) > 0) { //If anything interesting changed

                if (LOO(changes) > 0) {
                    io.emit('changes', changes);
                    Attacks.clearAttacks(entities)

                }                
                changes = {};

                if (playerInfoChange) {
                    io.emit('playerInfo', playerInfo);
                    playerInfoChange = false;
                }

            }
            if (Date.now() > lastAttacks + 1000) { //Send out attacks
                for(var e in entities){
                    Attacks.setEntitiesMap(entities[e]);
                }
                Attacks.addAttacks(entities);
                var attackChanges = Attacks.commitAttacks(entities);
                Object.assign(changes, attackChanges.changes);
                addPlayerMoneyChanges(attackChanges.playerMoneyChanges);
                lastAttacks = Date.now();
                emitCastles(io);
            }
            if (Date.now() > lastFullState + 1000) { //Send out a full state to keep in sync
                sendFullState(entities);
            }
            if(Date.now() > lastScores + 1000){
            	lastScores = Date.now();
            	setScores(castles, scores);
            	io.emit('scores', scores);
            	if(scores.blue <= 0 || scores.orange <= 0){
            		var winner;
            		if(scores.blue <= 0){
            			winner = 'orange';
            		}else{
            			winnder = 'blue';
            		}
            		
            		clearInterval(mainInterval);
            		gameOver(winner);
            	}
	            }
            redisClient.set('entities', JSON.stringify(entities));
        } else {
            console.err(err);
        }
    });
}, 1000 / tickRate);

}

function gameOver(winner){
	io.emit('gameOver', {winner: winner});
	console.log('gameOver');
	setTimeout(runServer, 1000 * 15);
}

function setScores(castles, scores){

	var numOrangeCastles = 0;
	var numBlueCastles = 0;

	for(var c in castles){
		for(var i in castles[c].color){
			if(castles[c].color[i].percent >= 1){
				if(castles[c].color[i].color === 'orange'){
					numOrangeCastles++;
				}else if(castles[c].color[i].color === 'blue'){
					numBlueCastles++;
				}
			}
		}
	}
	scores.blue -= (numOrangeCastles * pointsPerCastle);
	scores.orange -= (numBlueCastles * pointsPerCastle);

}

/************* Functions to send/modify info sent to client *******************/
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
}

function emitCastles(io) {
    Castles.clearEntitiesInCastles();
    for (var e in entities) {
        Castles.setEntitiesInCastles(entities[e]);
    }
    io.emit('castleColors', Castles.setCastleColors());
}

function sendFullState(entities) {
    io.emit('allEntities', entities);
    lastFullState = Date.now();
}

function addPath(data) {
    setChange(data.id, 'path', data.path);
    setChange(data.id, 'heading', data.heading);
    setChange(data.id, 'attacking', false);
}


function addPlayerMoneyChanges(playerMoneyChanges){
  if(playerMoneyChanges.length > 0){
    playerInfoChange = true;
  }
  for(var i in playerMoneyChanges){
    playerInfo[playerMoneyChanges[i].id] +=  playerMoneyChanges[i].gold;
  }
}
