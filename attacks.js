var Attacks = {
	entitiesMap: {},
	removeFromEntityMap(x, y, id){

		 if(Attacks.entitiesMap[x] && Attacks.entitiesMap[x][y]){
	      for(var i in Attacks.entitiesMap[x][y]){
	          if(Attacks.entitiesMap[x][y][i] == id){
	              Attacks.entitiesMap[x][y].splice(i, 1);

	              //if x,y node is empty, free up some space
	              /*if(Attacks.entitiesMap[x][y].length === 0){
	              	delete Attacks.entitiesMap[x][y];
	              	if(Object.keys(Attacks.entitiesMap[x]).length === 0 && Attacks.entitiesMap[x].constructor === Object){
	              		delete Attacks.entitiesMap[x];
	              	}

	              }*/
	              


	          }
	      }
	    }
	},
	setEntitiesMap(entity, newEntity){


	    var newX = ~~(entity.x / 32);
	    var newY = ~~(entity.y / 32);
	    var oldX = null;
	    var oldY = null;

	    if(entity.previousNode){
	    	//if there is a previous node then we will delete it and add in the new one
			oldX = (entity.previousNode.x);
	    	oldY = (entity.previousNode.y);
	    	if(oldX !== newX || oldY !== newY){ 
	    		Attacks.removeFromEntityMap(oldX, oldY, entity.id);

			    if(!Attacks.entitiesMap[newX]){
			      Attacks.entitiesMap[newX] = {};
			    }
			    if(!Attacks.entitiesMap[newX][newY]){
			      Attacks.entitiesMap[newX][newY] = [];
			    }

			    Attacks.entitiesMap[newX][newY].push(entity.id);

			    return true; //moved
		          }
      }else if(newEntity){
      	if(!Attacks.entitiesMap[newX]){
			      Attacks.entitiesMap[newX] = {};
			    }
			    if(!Attacks.entitiesMap[newX][newY]){
			      Attacks.entitiesMap[newX][newY] = [];
			    }

			    Attacks.entitiesMap[newX][newY].push(entity.id);
      }

	},
	attackableEntities(entity, entities) {
	  //Check if entities on nodes that are within range, then check if they are specifically within range via entity.x/.y
	  var attacks = [];
	  var nearbyEntities = [];
	  if (entity.attackType === 'sword' && !entity.dead) {
	    //console.log('z');
	    var nodeX = ~~(entity.x / 32);
	    var nodeY = ~~(entity.y / 32);
	    for (var i = nodeX - 1; i <= nodeX + 1; i++) {
	      //console.log('a')
	      for (var j = nodeY - 1; j <= nodeY + 1; j++) {
	        if (!Attacks.entitiesMap[i] || !Attacks.entitiesMap[i][j]) {
	          continue;
	        }
	        //console.log('b')
	        if (Attacks.entitiesMap[i][j].length > 0) {
	          //console.log('c')
	          var entitiesAtNode = Attacks.entitiesMap[i][j];
	          if(entitiesAtNode.length > 0){
  	  	          for (var e in entitiesAtNode) {
	           		 //console.log('d')
		            var charact = entities[entitiesAtNode[e]];
		            if (charact && !charact.dead && charact.playerId !== entity.playerId) { //don't attack yourself, could use this logic to heal
		              nearbyEntities.push(entities[entitiesAtNode[e]]);
		              //console.log('e')

		            }
		          }

	          }

	        }
	      }
	    }
	  } 

	  /*Stopped refactoring here, need to share entities on redis for playerId, x, y, attackType TODO*/
	  for (var i in nearbyEntities) {
	    var victim = nearbyEntities[i];
	    /*if (!attackEffects[(cantor(entity.id, victim.id))]) {
	      controller.init(victim.x, victim.y, entity.id, victim.id);
	    }*/

	      var attack = {
	        attacker: { id: entity.id, playerId: entity.playerId },
	        victim: { id: victim.id, playerId: victim.playerId },
	        power: 1 / nearbyEntities.length
	      };
	      attacks.push(attack);
	    
	  }
	  return attacks;
	}

}
exports.Attacks = Attacks;