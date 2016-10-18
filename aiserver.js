

"use strict"
var redis = require('redis');


const aiFile = require('./ai.js');
const AI = aiFile.AI; 

const blockingTerrainFile = require('./blockingTerrain.js');
const blockingTerrain = blockingTerrainFile.blockingTerrain;

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;


const server = express()
	.use(express.static(path.join(__dirname, 'public')))

const socketIO = require('socket.io');
const io = socketIO(server);
const pathSocket =  io.of('/path');


pathSocket.on('pathRequest', function(data){
	var path = AI.AStar({
		x: ~~(data.startX / 32),
		y: ~~(data.startY / 32)
	}, {
		x: ~~(data.endX / 32),
		y: ~~(data.endY / 32)
	}, blockingTerrain);
	
	pathSocket.emit('path', {id:data.id, path: path});
	
})

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




server.get('/path', function(req, res){
	var query = req.query;
	var path = AI.AStar({x: ~~(query.startX / 32), y: ~~(query.startY / 32)}, {x: ~~(query.endX / 32), y: ~~(query.endY / 32)}, blockingTerrain);
	res.send(path);
})
server.listen(PORT, () => console.log(`Listening on ${ PORT }`));


var entityStats = {
  'quarry': {'attack': 0, 'cost': 0, 'value': 100, 'object': true},
  'dwarfSoldier': {'attack': 10, 'cost' : 50, 'value' : 25},
  'elfFemale' : {'attack' : 12, 'cost' : 75, 'value' : 35},
  'humanSoldier' : {'attack' : 15, 'cost' : 120, 'value' : 60},
  'orcPeon' : {'attack' : 20, 'cost' : 150, 'value' : 75}
}






