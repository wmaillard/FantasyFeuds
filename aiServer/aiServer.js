

"use strict"
var redis = require('redis');
var playerId = 0;  // This will change on connection


const aiFile = require('./ai.js');
const AI = aiFile.AI; 

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))
	.listen(PORT, () => console.log(`Listening on ${ PORT }`));




var socketURL = 'http://localhost:5000';
if(process.env.DYNO){
  socketURL = 'https://fantasyfeuds.herokuapp.com';
  if(process.env.WEB_URL){
	   socketURL = process.env.WEB_URL;
  }
  console.log('**************' + socketURL + '*****************');
}
var pathURL = socketURL + '/path';

setTimeout(function(){
	const io = require('socket.io-client');
  const io2 = require('socket.io-client');
	//was .com/path

  var pathSocket = io(pathURL, {
      path: '/socket.io-client',
      transports: ['websocket'],
  })
	

	pathSocket.on('connect', function(){
    console.log('Pathfinding connected: ');
		pathSocket.on('pathRequest', function(data){
		var path = AI.AStar({
			x: ~~(data.startX / 32),
			y: ~~(data.startY / 32)
		}, {
			x: ~~(data.endX / 32),
			y: ~~(data.endY / 32)
		}, blockingTerrain);
    var heading = {x : data.endX, y: data.endY}

    pathSocket.emit('path', {id: data.id, path: path, heading : heading})


		})
	});
  var aiSocket = io2.connect(socketURL, {'force new connection': true});

  aiSocket.on('connect', function(){
    console.log('AISocket connected: ')
    var entities = {};
    playerId = aiSocket.id;
    controlAI(aiSocket, entities);


  })

	}, 500)

function controlAI(socket, entities){
  var Entity = require('./entities').Entity;
  addQuarries(Entity, socket, entities);


}
function addQuarries(Entity, socket, entities){
    var levelWidth = 1000;
  var levelHeight = 1000;
  for (var i = 0; i < 250; i++) {
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
    socket.emit('addEntity', { pw: 'password', entity: newQuar });


  }
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
  'quarry': {'attack': 0, 'cost': 0, 'value': 100, 'object': true},
  'dwarfSoldier': {'attack': 10, 'cost' : 50, 'value' : 25},
  'elfFemale' : {'attack' : 12, 'cost' : 75, 'value' : 35},
  'humanSoldier' : {'attack' : 15, 'cost' : 120, 'value' : 60},
  'orcPeon' : {'attack' : 20, 'cost' : 150, 'value' : 75}
}







