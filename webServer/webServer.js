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
var compression = require('compression')
var http = require('http');
const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, '../public')));
var server = http.createServer(app);
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
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
var scores = { 'orange': 1000, 'blue': 1000 }
var blankGameLength = 20; //minutes
var pointsPerCastle = 1000 / 60 / 5 / blankGameLength; //5 = num start castles, 1000 points 60 seconds
var nextPlayer = 'orange';
var pw = 'password';
var walkingEntities = {};
/************** Web Worker Sockets **********************/
pathSocket.on('connection', function(socket) {
    console.log('********* web worker connected **********');
    pathSocketConnection = socket;
    socket.on('path', (data) => {
        addPath(data);
    });
});
/*********** Client Sockets ************************/
io.on('connection', (socket) => {
    console.log('client connected');
    if (!playerInfo[convertId(socket.id)]) {
        playerInfo[convertId(socket.id)] = {};
    }
    playerInfo[convertId(socket.id)].gold = startGold;
    playerInfo[convertId(socket.id)].team = nextPlayer;
    socket.emit('team', nextPlayer);
    if (nextPlayer === 'orange') {
        nextPlayer = 'blue';
    } else {
        nextPlayer = 'orange';
    }
    redisClient.set('change', 'true');
    socket.on('entityPathRequest', (data) => {
    	if(entities[data.id]){
            data.startX = entities[data.id].x;
            data.startY = entities[data.id].y;
            pathSocketConnection.emit('pathRequest', data);
    	}
    });
    socket.on('addEntity', (data) => {
        if(data.pw === pw){
            setChange(data.entity.id, 'wholeEntity', data.entity);
            Attacks.setEntitiesMap(data.entity, true);

        }
        else if( playerInfo[convertId(socket.id)].gold >= entityInfo[data.entity.type].cost && (Castles.canAddHere(data.entity) || withinPlayerCircle(entities, data.entity))) {
            playerInfo[convertId(socket.id)].gold -= entityInfo[data.entity.type].cost;
            playerInfoChange = true;
            setChange(data.entity.id, 'wholeEntity', data.entity) //using client data here, fix
            Attacks.setEntitiesMap(data.entity, true);
            socket.emit('addEntitySuccess', { entity: data.entity });
        } else socket.emit('addEntityFailure', { entity: data.entity });
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
});
runServer();

function withinPlayerCircle(entities, entity) {
    var radius = 250;
    var rx = radius / 2.5;
    var ry = radius / 3;
    for (var e in entities) {
        if (entities[e].team === entity.team && !entities[e].attacking) {
            if (Math.pow((entity.x - entities[e].x), 2) / Math.pow(rx, 2) + Math.pow((entity.y - entities[e].y), 2) / Math.pow(ry, 2) < 1) {
                return true;
            }
        }
    }
    return false;
}

function clearPlayerInfo(playerInfo) {
    for (var player in playerInfo) {
        playerInfo[player].gold = startGold;
    }
}

function runServer() {
    clearPlayerInfo(playerInfo);
    playerInfoChange = true;
    tickRate = 15; // in hz
    changes = {};
            redisClient.set('changes', JSON.stringify(changes));

    attacks = [];
        redisClient.set('attacks', JSON.stringify(attacks));

    entities = {};
        redisClient.set('entities', JSON.stringify(entities));

    lastAttacks = Date.now() + 500;
    lastFullState = Date.now() - 1001;
    redisClient = redis.createClient(process.env.REDIS_URL);
    LOO = require('./generalUtilities').LOO;
    moveEntitiesFile = require('./moveEntities.js').moveEntities;
    moveEntities = moveEntitiesFile.moveEntities;
    lastScores = Date.now() - 10000;
    scores = { 'orange': 1000, 'blue': 1000 }
    var castles = require('./castles.js').castles.castles;
    /*******************Main Server Loop ************************************/
    var mainInterval = setInterval(() => {
        redisClient.get('changes', function(err, outsideChanges) {
            outsideChanges = JSON.stringify(outsideChanges);
            if (!err) {
                outsideChanges = JSON.stringify(outsideChanges);
                if (LOO(outsideChanges) > 0) {
                    Object.assign(changes, outsideChanges) //Apply outside changes
                    redisClient.set('changes', JSON.stringify({}));
                }
                Object.assign(changes, moveEntities(walkingEntities)); //Move entities, 
                if (LOO(changes) > 0) { //If anything interesting changed
                    for (var i in changes) {
                        if (entities[i]) {
                            for (var j in changes[i]) {
                                entities[i][j] = changes[i][j]
                                if(entities[i][j] === 'path'){
                                    walkingEntities[i] = entities[i];
                                }else if(entities[i][j] === 'walking' && changes[i][j] === false){
                                    delete walkingEntities[i];
                                }
                            }
                        } else {
                            entities[i] = changes[i];
                        }
                    }
                    if (LOO(changes) > 0) {
                        io.emit('changes', changes);
                    }
                    changes = {};
                    if (playerInfoChange) {
                        io.emit('playerInfo', playerInfo);
                        playerInfoChange = false;
                    }
                }
                if (Date.now() > lastAttacks + 750) { //Send out attacks
                    for (var e in entities) {
                        Attacks.setEntitiesMap(entities[e]);
                    }
                    
                    var attackChanges = Attacks.commitAttacks(entities);
                    Object.assign(changes, attackChanges.changes);
                    addPlayerMoneyChanges(attackChanges.playerMoneyChanges);
                    lastAttacks = Date.now();
                    emitCastles(io);
                }
                if (Date.now() > lastFullState + 1000) { //Send out a full state to keep in sync
                    sendFullState(entities);
                }
                if (Date.now() > lastScores + 1000) {
                    lastScores = Date.now();
                    setScores(castles, scores);
                    io.emit('scores', scores);
                    if (scores.blue <= 0 || scores.orange <= 0) {
                        var winner;
                        if (scores.blue <= 0) {
                            winner = 'orange';
                        } else {
                            winner = 'blue';
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

function gameOver(winner) {
    io.emit('gameOver', { winner: winner });
    console.log('gameOver');
    runServer();
}

function setScores(castles, scores) {
    var numOrangeCastles = 0;
    var numBlueCastles = 0;
    for (var c in castles) {
        for (var i in castles[c].color) {
            if (castles[c].color[i].percent >= 1) {
                if (castles[c].color[i].color === 'orange') {
                    numOrangeCastles++;
                } else if (castles[c].color[i].color === 'blue') {
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
        //entities[entityId] = value;
        changes[entityId] = value;
    } else {
        //entities[entityId][key] = value;
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

function addPlayerMoneyChanges(playerMoneyChanges) {
    if (playerMoneyChanges.length > 0) {
        playerInfoChange = true;
    }
    for (var i in playerMoneyChanges) {
        playerInfo[playerMoneyChanges[i].id].gold += playerMoneyChanges[i].gold;
    }
}
