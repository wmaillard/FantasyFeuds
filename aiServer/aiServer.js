"use strict"
var redis = require('redis');
var redisClient = redis.createClient(process.env.REDIS_URL);
var playerId = 0; // This will change on connection
const aiFile = require('./ai.js');
const AI = aiFile.AI;
const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;
const numberOfQuarries = 500;
const cluster = require('cluster');


if (cluster.isMaster) {
	var workers = {};
	workers.pathfinders = {};
    var numWorkers = require('os').cpus().length;
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
	if(~~(Math.random() * 2) === 0){
		var socketURL = 'http://localhost:5000';
	}else{
		var socketURL = 'http://localhost:3000';
	}

	if (process.env.DYNO) {
	    socketURL = 'https://fantasyfeuds.herokuapp.com';
	    if (process.env.WEB_URL) {
	        socketURL = process.env.WEB_URL;
	    }
	}
	var pathURL = socketURL + '/path';

	redisClient.get('workers', function(err, workers){
	var workers = JSON.parse(workers);

    const PORT = process.env.PORT || 3000;
    var app = require('express')();
    const server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
        		

    if (workers.pathfinders[process.pid]) {
            const io = require('socket.io-client');
            var pathSocket = io(pathURL, {
                path: '/socket.io-client',
                transports: ['websocket'],
            })
            pathSocket.on('connect', function() {
                console.log('Pathfinding connected for pid: ', process.pid);
                console.log('**********', pathURL, '***********')
                pathSocket.on('pathRequest', function(data) {
                	console.log('Pathfinding request', process.pid);
                	redisClient.set('Pathfinder' + process.pid, 'busy');
                    var path = AI.AStar({
                        x: ~~(data.startX / 32),
                        y: ~~(data.startY / 32)
                    }, {
                        x: ~~(data.endX / 32),
                        y: ~~(data.endY / 32)
                    }, blockingTerrain);
                    var heading = { x: data.endX, y: data.endY }
                    pathSocket.emit('path', { id: data.id, path: path, heading: heading }, function(err){
                    	redis.set('Pathfinder' + process.pid, 'free');
                    })


                })
		    pathSocket.on('AIAttacked', function(err, data){
			console.log(data);
		    }
                    pathSocket.on('disconnect', function(){
            		console.log('Pathfinding disconnected for pid: ', process.pid);

            	})
            });

        
    } else if (workers.AI === process.pid) {
        const io2 = require('socket.io-client');
        var aiSocket = io2.connect(socketURL, { 'force new connection': true });
        aiSocket.on('connect', function() {
            console.log('AISocket connected')
            var entities = {};
            playerId = aiSocket.id;
            setTimeout(function() {
                controlAI(aiSocket, entities);
            }, 5000)
        });
    }
    })
}


function controlAI(socket, entities) {
    var Entity = require('./entities').Entity;
    addQuarries(Entity, socket, entities);
}

function addQuarries(Entity, socket, entities) {
    var levelWidth = 1000;
    var levelHeight = 1000;
    for (var i = 0; i < 1000; i++) {
        var start = {};
        start.x = ~~(Math.random() * levelWidth * 32);
        start.y = ~~(Math.random() * levelHeight * 32);
        var newQuar = new Entity(start, 100, 'quarry', playerId, 'grey', 'ai');
        while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
            newQuar.x = ~~(Math.random() * levelWidth * 32);
            newQuar.y = ~~(Math.random() * levelHeight * 32);
        }
        newQuar.attackType = 'none';
        newQuar.id = Date.now() + i * 200;
        entities[newQuar.id] = newQuar;
    }
    socket.emit('addEntity', { pw: 'password', entities: entities });
    console.log('Added Quarries')
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
