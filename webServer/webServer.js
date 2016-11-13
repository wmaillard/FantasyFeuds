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
var playerColors = require('./playerColors.js').playerColors;
playerColors.next = {};
playerColors.next.orange = 0;
playerColors.next.blue = 0;
/************** Web Worker Sockets **********************/
pathSocket.on('connection', function(socket) {
    console.log('********* web worker connected **********');
    pathSocketConnection = socket;
    socket.on('path', (data) => {
        addPath(data);
    });
    socket.on('failed', (data) =>{
        io.emit('pathfindingFailed', data);
    })
});
/*********** Client Sockets ************************/
io.on('connection', (socket) => {
    console.log('client connected');
    if (!playerInfo[convertId(socket.id)]) {
        playerInfo[convertId(socket.id)] = {};
    }
    playerInfo[convertId(socket.id)].gold = startGold;
    playerInfo[convertId(socket.id)].team = nextPlayer;
    lastFullState = 0;
    socket.emit('team', nextPlayer);
    try{
    var playerColor = playerColors[nextPlayer][playerColors.next[nextPlayer]];
}catch(e){
    console.log(playerColors);
}
    playerColors.next[nextPlayer]++;
    playerColors.next[nextPlayer] %= playerColors[nextPlayer].length;
    socket.emit('playerColor', playerColor);

    if (nextPlayer === 'orange') {
        nextPlayer = 'blue';
    } else {
        nextPlayer = 'orange';
    }
    redisClient.set('change', 'true');
    socket.on('entityPathRequest', (data) => {
        if (pathSocketConnection && entities[data.id]) {
            data.startX = entities[data.id].x;
            data.startY = entities[data.id].y;
            pathSocketConnection.emit('pathRequest', data);
        }
    });
    socket.on('addEntity', (data) => {
        if (data.pw === pw) {
            for (var e in data.entities) {
                setChange(data.entities[e].id, 'wholeEntity', data.entities[e]);
                Attacks.setEntitiesMap(data.entities[e], true);
            }
        } else if (playerInfo[convertId(socket.id)].gold >= entityInfo[data.entity.type].cost && (Castles.canAddHere(data.entity) || withinPlayerCircle(entities, data.entity))) {
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
        if (!entities[e].dead && entities[e].team === entity.team && !entities[e].attacking) {
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

function mergeObjectsTwoLayers(base, addition) {
    for (var e in addition) {
        if (base[e] === undefined) {
            base[e] = addition[e];
        } else {
            for (var i in addition[e]) {
                if (base[e][i] === undefined) {
                    base[e][i] = addition[e][i];
                }
            }
        }
    }
}

function runServer() {
    clearPlayerInfo(playerInfo);
    playerInfoChange = true;
    tickRate = 30; // in hz
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
                if (!err) {
                    outsideChanges = JSON.stringify(outsideChanges);
                    //Apply outside changes, not currently used
                    if (LOO(outsideChanges) > 0) {
                        Object.assign(changes, outsideChanges)
                        redisClient.set('changes', JSON.stringify({}));
                    }
                    //Move entities 
                    var moved = {};
                    if (LOO(walkingEntities) > 0) {
                        moved = moveEntities(walkingEntities);
                        /* console.log('*******moved**************');
                         console.log(JSON.stringify(moved));
                         console.log('**********changes*************');
                         console.log(JSON.stringify(changes));*/
                        applyChanges(moved, io);
                    }
                    applyChanges(changes, io);
                    changes = {};
                    if (playerInfoChange) {
                        io.emit('playerInfo', playerInfo);
                        playerInfoChange = false;
                    }
                    if (Date.now() > lastAttacks + 1000) { //Send out attacks
                        for (var e in entities) {
                            Attacks.setEntitiesMap(entities[e]); //O(n) but it means we don't have to keep an extra O(n) space.
                        }

                        var toAlert = alertNearbyAI(Attacks.movedNonAI);
                        if(LOO(toAlert) > 0){
                            pathSocket.emit('nearbyEntities', toAlert);
                        }
                        Attacks.movedNonAI = {};

                        var attackChanges = Attacks.commitAttacks(entities);
                        if (LOO(attackChanges.AIAttacked) > 0) {
                            pathSocketConnection.emit('AIAttacked', attackChanges.AIAttacked);
                        }
                        mergeObjectsTwoLayers(changes, attackChanges.changes);
                        addPlayerMoneyChanges(attackChanges.playerMoneyChanges);
                        lastAttacks = Date.now();
                        emitCastles(io, entities);
                    }
                    if (Date.now() > lastFullState + 10000) { //Send out a full state to keep in sync
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
        },
        1000 / tickRate);
}

function alertNearbyAI(movedEntities) {
    //only alert if AI is not already moving, that way we don't get a ton of path requests
    //This takes O(range * range)ish
    var alerted = {};
    var range = 20;
    for (var e in movedEntities) {
        var node = { x: ~~(movedEntities[e].x / 32), y: ~~(movedEntities[e].y / 32) }
        for (var x = node.x - range / 2; x < node.x + range / 2; x++) {
            if (x < 0) {
                x = 0;
                continue;
            } else if (x > 1000) {
                break;
            }
            for (var y = node.y - range / 2; y < node.y + range / 2; y++) {
                if (y < 0) {
                    y = 0;
                    continue
                } else if (y > 1000) {
                    break;
                } else if (Attacks.entitiesMap[x] && Attacks.entitiesMap[x][y] && Attacks.entitiesMap[x][y].length > 0) {
                    for (var f in Attacks.entitiesMap[x][y]) {
                            //Change logic here if they are too stupid and not following clients fast enough
                            if (entities[Attacks.entitiesMap[x][y][f]].health > 0 && entities[Attacks.entitiesMap[x][y][f]].aiType && entities[Attacks.entitiesMap[x][y][f]].aiType === 'aggressive'  && !entities[Attacks.entitiesMap[x][y][f]].attacking) {
                                alerted[Attacks.entitiesMap[x][y][f]] = {start : {x: x, y: y}, victim : {x : node.x, y: node.y, id: e}, health : entities[Attacks.entitiesMap[x][y][f]].health};
                            }
                        
                    }
                }
            }
        }
    }
    return alerted;
}

function applyChanges(changes, socket) {
    //If anything interesting changed
    if (LOO(changes) > 0) {
        //Loop through entities that have changed
        for (var i in changes) {
            if (entities[i]) {
                //Loop through changes per entity
                for (var j in changes[i]) {
                    entities[i][j] = changes[i][j]
                    if (j === 'path') {
                        walkingEntities[i] = entities[i];
                    } else if (j === 'walking' && changes[i][j] === false) {
                        delete walkingEntities[i];
                    }
                }
            } else if (changes[i]) {
                //Don't have entity on record
                changes[i].walking = false;
                entities[i] = changes[i];
            }
        }
        if (socket) {
            socket.emit('changes', changes);
        }
    }
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
        changes[entityId] = value;
    } else {
        if (!changes[entityId]) {
            changes[entityId] = {};
        }
        changes[entityId][key] = value;
    }
}

function emitCastles(io, entities) {
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
    setChange(data.id, 'previousNode', entities[data.id].nextNode);
}

function addPlayerMoneyChanges(playerMoneyChanges) {
    if (playerMoneyChanges.length > 0) {
        playerInfoChange = true;
    }
    for (var i in playerMoneyChanges) {
        playerInfo[playerMoneyChanges[i].id].gold += playerMoneyChanges[i].gold;
    }
}
