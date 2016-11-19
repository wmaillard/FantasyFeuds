"use strict"
var redis = require('redis');
var redisClient = redis.createClient(process.env.REDIS_URL);
var playerId = 0; // This will change on connection
const aiFile = require('./ai.js');
const AI = aiFile.AI;
const blockingTerrain = require('./blockingTerrain.js').blockingTerrain;
const numberOfQuarries = 500;
const cluster = require('cluster');
const entityInfo = require('./entityInfo.js').entityInfo;
var passiveEntities = {};
var activeEntities = {};
var aggressiveEntities = {};
var numPassive = 250;
var numAggressive = 350;
var numActive = 750;

var possibleAggressive = [];
var possibleActive = [];
var possiblePassive = [];

for(var e in entityInfo){
    if(entityInfo[e].image){
        possibleAggressive.push(e);
    }else if(e === 'quarry'){
        possiblePassive.push(e);
    }else{
        possibleActive.push(e);
    }
}



if (cluster.isMaster) {
    var workers = {};
    workers.pathfinders = {};
    var numWorkers = 1; //require('os').cpus().length;
    console.log(numWorkers);
    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    cluster.on('online', function(worker) {
        if (!workers.AI) {
            workers.AI = worker.process.pid;
        } else {
            workers.pathfinders[worker.process.pid] = true;
        }
        console.log('Worker ' + worker.process.pid + ' is online');
        redisClient.set('workers', JSON.stringify(workers));
    });
    cluster.on('exit', function(worker, code, signal) {
        delete workers.pathfinders[worker.process.pid];
        redisClient.set('workers', JSON.stringify(workers));
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    var aiSocket;
    var socketURL = 'http://localhost:5000';
    if (process.env.DYNO) {
        socketURL = 'https://fantasyfeuds.herokuapp.com';
        if (process.env.WEB_URL) {
            socketURL = process.env.WEB_URL;
        }
    }
    var pathURL = socketURL + '/path';
    redisClient.get('workers', function(err, workers) {
        var workers = JSON.parse(workers);
        const PORT = process.env.PORT || 3000;
        var app = require('express')();
        const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
        const io = require('socket.io-client');
        var pathSocket = io(pathURL, {
            path: '/socket.io-client',
            transports: ['websocket'],
        })
        pathSocket.on('connect', function() {
            console.log('Pathfinding connected for pid: ', process.pid);
            console.log('**********', pathURL, '***********')
            pathSocket.on('pathRequest', function(data) {
                //console.log('Pathfinding request', process.pid);
                var path = AI.AStar({
                    x: ~~(data.startX / 32),
                    y: ~~(data.startY / 32)
                }, {
                    x: ~~(data.endX / 32),
                    y: ~~(data.endY / 32)
                }, blockingTerrain);
                if(path.length > 0){
	                var heading = { x: data.endX, y: data.endY }
	                pathSocket.emit('path', { id: data.id, path: path, heading: heading });
            	}else{
            		pathSocket.emit('failed', data.id);
            	}
            })
            pathSocket.on('AIAttacked', function(data) {
                for (var e in data) {
                    if (data[e].aiType === 'active') {
                        setTimeout(function() {
                            entityFlee(data[e], pathSocket);
                        }, 1000);
                    } else if (data[e].aiType === 'aggressive') {
                        if (data[e].health < 25) {
                            entityFlee(data[e], pathSocket);
                        }
                    }
                }
            })
            pathSocket.on('nearbyEntities', function(data) {
                for (var e in data) {
                    if (data[e].health > 25) {
                        var coords = {
                            startX: data[e].start.x,
                            startY: data[e].start.y,
                            endX: (data[e].victim.x - 1) * 32 + 2 * Math.random() * 32, //Randomly placed on 4 nodes
                            endY: (data[e].victim.y - 1) * 32 + 2 * Math.random() * 32,
                            id: e
                        }

                        aiSocket.emit('entityPathRequest', coords);
                    }
                }
            })
            var divisor = 20;
            var fraction = 0;
            setInterval(function() {
                makeThemWalk(aggressiveEntities, fraction, divisor, pathSocket, numAggressive);
                makeThemWalk(activeEntities, fraction, divisor, pathSocket, numActive);
                fraction++;
                fraction %= divisor;
            }, 2500);
            pathSocket.on('disconnect', function() {
                console.log('Pathfinding disconnected for pid: ', process.pid);
            })
        });
        const io2 = require('socket.io-client');
        var addedAI = false;
        aiSocket = io2.connect(socketURL, { 'force new connection': true });
        aiSocket.on('connect', function() {
            console.log('AISocket connected');
            aiSocket.on('gameOver', function(){
                passiveEntities = {};
                activeEntities = {};
                aggressiveEntities = {};
                controlAI(aiSocket);
            })
            playerId = aiSocket.id;
            if (!addedAI) {
                setTimeout(function() {
                    controlAI(aiSocket);
                    addedAI = true;
                }, 500)
            }
        });
    })
}

function makeThemWalk(entities, fraction, divisor, pathSocket, numEntities) {
    var i = -1;
    for (var e in entities) {
        i++;
        if (i < fraction * numEntities / divisor) {
            continue;
        } else if (i < (fraction + 1) * numEntities / divisor) {
            entityFlee(entities[e], pathSocket);
            try {
                entityFlee(entities[e], pathSocket);
            } catch (e) {
                console.log(entities[e])
            }
            continue;
        }
        break;
    }
}

function entityFlee(entity, socket) {
    var i = 0;
    var levelWidth = 1000;
    var levelHeight = 1000;
    var end = {};
    var midPoint = {};
    var time = Date.now();
    var failed = false;
    try {
        end.x = ~~(Math.random() * (20 * 32) + entity.x - 10 * 32); //The width is 20 * 32 the midpoint is entity.x - 10 * 32 
        end.y = ~~(Math.random() * (20 * 32) + entity.y - 10 * 32);
        while (end.x < 0 || end.x > levelWidth * 32 || end.y < 0 || end.y > levelHeight * 32 || blockingTerrain[~~(end.x / 32)][~~(end.y / 32)]) {
            if (Date.now() > time + 5) {
                failed = true;
                break;
            }
            end.x = ~~(Math.random() * (20 * 32) + entity.x - 10 * 32); //The width is 20 * 32 the midpoint is entity.x - 10 * 32 
            end.y = ~~(Math.random() * (20 * 32) + entity.y - 10 * 32);
        }
    } catch (e) {
        failed = true;
    }
    if (!failed) {
        var path = AI.AStar({
                    x: ~~(entity.x / 32),
                    y: ~~(entity.y / 32)
                }, {
                    x: ~~(end.x / 32),
                    y: ~~(end.y / 32)
                }, blockingTerrain);
                if(path.length > 0){
                    var heading = { x: end.x, y: end.y}
                    socket.emit('path', { id: entity.id, path: path, heading: heading });
                    entity.x = end.x;
                    entity.y = end.y;
                }

    } else {
        console.log('Error: Failed to find end point for ai flee path')
    }
}

function controlAI(socket) {
    var Entity = require('./entities').Entity;
    addPassive(Entity, passiveEntities, numPassive);
    addActive(Entity, activeEntities, numActive);
    addAggressive(Entity, aggressiveEntities, numAggressive);
    socket.emit('addEntity', { pw: 'password', entities: aggressiveEntities });
    socket.emit('addEntity', { pw: 'password', entities: passiveEntities });
    socket.emit('addEntity', { pw: 'password', entities: activeEntities });
}
var levelWidth = 1000;
var levelHeight = 1000;
function addAggressive(Entity, entities, num) {

    for (var i = 0; i < num; i++) {
        var start = {};
        start.x = ~~(Math.random() * levelWidth * 32);
        start.y = ~~(Math.random() * levelHeight * 32);
        var orc = new Entity(start, 100, possibleAggressive[~~(Math.random() * possibleAggressive.length)], playerId, 'black', 'ai');
        while (blockingTerrain[~~(orc.x / 32)][~~(orc.y / 32)]) {
            orc.x = ~~(Math.random() * levelWidth * 32);
            orc.y = ~~(Math.random() * levelHeight * 32);
        }
        orc.attackType = 'sword';
        orc.id = Date.now() + i * 200;
        orc.aiType = 'aggressive'; //passive, active, or aggressive
        entities[orc.id] = orc;
    }
    console.log('Added Orcs')
}

function addPassive(Entity, entities, num) {

    for (var i = 0; i < num; i++) {
        var start = {};
        start.x = ~~(Math.random() * levelWidth * 32);
        start.y = ~~(Math.random() * levelHeight * 32);
        var newQuar = new Entity(start, 100, possiblePassive[~~(Math.random() * possiblePassive.length)], playerId, 'black', 'ai');
        while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
            newQuar.x = ~~(Math.random() * levelWidth * 32);
            newQuar.y = ~~(Math.random() * levelHeight * 32);
        }
        newQuar.attackType = 'none';
        newQuar.id = Date.now() + i * 200;
        newQuar.aiType = 'passive'; //passive, active, or aggressive
        entities[newQuar.id] = newQuar;
    }
    console.log('Added Quarries')
}

function addActive(Entity, entities, num) {

    for (var i = 0; i < num; i++) {
        var start = {};
        start.x = ~~(Math.random() * levelWidth * 32);
        start.y = ~~(Math.random() * levelHeight * 32);
        var newHydra = new Entity(start, 100,  possibleActive[~~(Math.random() * possibleActive.length)], playerId, 'black', 'ai');
        while (blockingTerrain[~~(newHydra.x / 32)][~~(newHydra.y / 32)]) {
            newHydra.x = ~~(Math.random() * levelWidth * 32);
            newHydra.y = ~~(Math.random() * levelHeight * 32);
        }
        newHydra.attackType = 'none';
        newHydra.id = Date.now() + i * 200;
        newHydra.aiType = 'active'; //passive, active, or aggressive
        entities[newHydra.id] = newHydra;
    }
    console.log('added Hydras')
}

function setPathfinding() {
    var pub = redis.createClient(process.env.REDIS_URL); //type 'redis-server' in the file in mydocs
    var sub = redis.createClient(process.env.REDIS_URL); //type 'redis-server' in the file in mydocs
    sub.subscribe('getPath', function(err, reply) {
        sub.on("message", function(channel, message) {
            console.log("sub channel " + channel + ": " + message);
            if (channel === 'getPath') {
                message = JSON.parse(message);
                var path = AI.AStar({
                    x: ~~(message.startX / 32),
                    y: ~~(message.startY / 32)
                }, {
                    x: ~~(message.endX / 32),
                    y: ~~(message.endY / 32)
                }, blockingTerrain);
                pub.publish('path' + message.id, JSON.stringify(path), function(err) {});
            }
        });
    });
}
var entityStats = {
    'quarry': { 'attack': 0, 'cost': 0, 'value': 100, 'object': true },
    'dwarfSoldier': { 'attack': 10, 'cost': 50, 'value': 25 },
    'elfFemale': { 'attack': 12, 'cost': 75, 'value': 35 },
    'humanSoldier': { 'attack': 15, 'cost': 120, 'value': 60 },
    'orcPeon': { 'attack': 20, 'cost': 150, 'value': 75 }
}
