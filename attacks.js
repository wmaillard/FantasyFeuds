var Attacks = {
	entitiesMap: {},
	removeFromEntityMap(x, y, id){
		console.log('testing to delete x:', x, 'y: ', y, 'id: ', id);
		console.log('from: ', Attacks.entitiesMap)
		 if(Attacks.entitiesMap[x] && Attacks.entitiesMap[x][y]){
	      for(var i in Attacks.entitiesMap[x][y]){
	          if(Attacks.entitiesMap[x][y][i] == id){
	              Attacks.entitiesMap[x][y].splice(i, 1);

	              //if x,y node is empty, free up some space
	              if(Attacks.entitiesMap[x][y].length === 0){
	              	delete Attacks.entitiesMap[x][y];
	              	if(Object.keys(Attacks.entitiesMap[x]).length === 0 && Attacks.entitiesMap[x].constructor === Object){
	              		delete Attacks.entitiesMap[x];
	              	}

	              }
	              


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
			    console.log('entitiesMap', Attacks.entitiesMap)

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

	}
}
exports.Attacks = Attacks;