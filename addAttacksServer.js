var redis = require('redis');

const attacksFile = require('./attacks.js');
const Attacks = attacksFile.Attacks;

const entityInfoFile = require('./entityInfo.js');
const entityInfo = entityInfoFile.entityInfo;

const express = require('express');

const socketIO = require('socket.io');
const path = require('path'); //What is this?
var request = require('request');

const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

var attacks = [];
var lastAttacks = Date.now();

setInterval(() => {

	addAttacks();
	   if (Date.now() > lastAttacks + 1000){
	   	redisClient.get('entities', function(err, data){
	   		var entities = JSON.parse(data);
	   		applyAttacks(attacks, entities);
	   		redisClient.set('entities', entities);
	   		lastAttacks = Data.now();
	   	})
	   	
	   }




	}


function addAttacks(){
	attacks = [];
	redisClient.get('entities', function(err, data){
		if (err) {
          console.err(err);
        }
		var entities = JSON.parse(data);

		for (var entity in entities){
			var attack = Attacks.attackableEntities(entities[entity], entities);
			attacks.push(attack);
		}
		redisClient.set('attacks', JSON.stringify(attacks));




	})


}


function applyAttacks(attacks, allEntities) {
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

function setChange(entityId, key, value) {
    redisClient.set('change', 'true');
    redisClient.set('entities', JSON.stringify(allEntities));
    redisClient.get('changes', function(err, data) {
        if (!err) {
            var changes = JSON.parse(changes);
            if (!changes[entityId]) {
                changes[entityId] = {};
            }
            changes[entityId][key] = value;
        }
        redisClient.set('changes', JSON.stringify(changes));
    }
}
