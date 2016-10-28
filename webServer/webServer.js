"use strict"
var redis = require('redis');
var castles = require('./castles.js').castles
const blockingTerrain = require('./blockingTerrain.js').blockingTerrain;
const Attacks = require('./attacks.js').Attacks;
const entityInfo = require('./entityInfo.js').entityInfo;
const express = require('express');
const socketIO = require('socket.io');
const path = require('path'); //What is this?
var request = require('request');
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

var tickRate = 30; // in hz
var changes = {};
var attacks = [];
var entities = {};
var playerInfo = {};
var playerInfoChange = false;
var lastAttacks = Date.now() + 500;
var lastFullState = Date.now() - 1001;
var clientSocketConnection; //Used to talk with the client
var pathSocketConnection;
const startGold = 10000;
var redisClient = redis.createClient(process.env.REDIS_URL);
var LOO = require('./generalUtilities').LOO;
var moveEntitiesFile = require('./moveEntities.js').moveEntities;
var moveEntities = moveEntitiesFile.moveEntities;

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

/*******************Main Server Loop ************************************/
setInterval(() => {
    redisClient.get('change', function(err, outsideChange) {
        if (!err) {
            if (LOO(changes) > 0 || outsideChange === 'true') { //If anything interesting changed
                Object.assign(changes, moveEntities(entities));  //merge changes and results from moveEntities
                if (LOO(changes) > 0) {
                    io.emit('changes', changes);
                    changes = {};
                    redisClient.set('changes', JSON.stringify({}));
                    
                }
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
            redisClient.set('entities', JSON.stringify(entities));
        } else {
            console.err(err);
        }
    });
}, 1000 / tickRate);


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
    castles.clearEntitiesInCastles();
    for (var e in entities) {
        castles.setEntitiesInCastles(entities[e]);
    }
    io.emit('castleColors', castles.setCastleColors());
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