//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);



var AI = {
  //A* tutorial: http://www.policyalmanac.org/games/aStarTutorial.html
  //https://en.wikipedia.org/wiki/A*_search_algorithm
  //10 points for adjacent node 14 for diagonal



  AStar: function(startNode, eNode, blockingTerrain){  //This takes about  6 ms right now, pretty good!
    if(blockingTerrain[startNode.x][startNode.y] || blockingTerrain[eNode.x][eNode.y]){
      return [];
    }
    this.terrainArray = blockingTerrain;
    this.closedSet = [];
    this.openSet = [];
    var cNode = startNode;
    cNode.GScore = 0;
    cNode.HScore = this.calcHScore(cNode, eNode);
    cNode.FScore = startNode.GScore + cNode.HScore;
    this.openSet.push(cNode);



    do{
      cNode = this.getLowestFScore(this.openSet);
      this.addNonBlockedNeighborsToOpen(cNode, eNode);
      var index = this.findInArray(cNode, this.openSet);

      if(index === -1){
        console.log('did not find cNode in openSet')
        break;
      }
      this.openSet.splice(index, 1); //get rid of cNode
      this.closedSet.push(cNode);

      if(cNode.x === eNode.x && cNode.y === eNode.y){
        //console.log('found end');
        var path = this.drawPath(cNode, startNode);
        return path;
      }

    }while(this.openSet.length > 0)

    return [];



  },
  drawPath(cNode, startNode){
    var path = [];
    var endNode = cNode;
    do{
      var coords = {};
      coords.x = cNode.x;
      coords.y = cNode.y;
      path.push(coords);
    }while(cNode = cNode.parent)
    return path;
  },
  addNonBlockedNeighborsToOpen: function(cNode, eNode){
    for(var i = 0; i < 8; i++){
      var nextNode = this.getNextNodeCoords(cNode, i);
      if(this.checkIfFree(nextNode) && this.findInArray(nextNode, this.closedSet) === -1){

        nextNode.parent = cNode;
        this.setScores(nextNode, eNode, i);

        var index = this.findInArray(nextNode, this.openSet); 
        if(index !== -1){
          if(this.openSet[index].GScore > nextNode.GScore){
            this.openSet[index].GScore = nextNode.GScore;
            this.openSet[index].FScore = this.openSet[index].GScore + this.openSet[index].HScore
            this.openSet[index].parent = cNode;

          }
        }
        else{
          this.openSet.push(nextNode);  //Change this to a priority queue at some point
        }

      }
    }
  },
  setScores: function(nextNode, eNode, neighborNum){
    nextNode.GScore = this.calcGScore(nextNode, neighborNum);
    nextNode.HScore = this.calcHScore(nextNode, eNode);
    nextNode.FScore = nextNode.GScore + nextNode.HScore;
  },
  findInArray: function(item, array){
    for(var i = 0; i < array.length; i++){
      if(array[i].x === item.x && array[i].y === item.y){
        return i;
      }
    }
    return -1;
  },
  getLowestFScore: function(set){
    var lowest = {};
    lowest.FScore = Number.MAX_SAFE_INTEGER;
    for(var i = 0; i < set.length; i++){
      if(set[i].FScore < lowest.FScore){
        lowest = set[i];
      }
    }
    return lowest;
  },


  calcHScore: function(nextCoords, eNode){
    //diagonal distance no weight from here: http://www.growingwiththeweb.com/2012/06/a-pathfinding-algorithm.html
    
    //return Math.max(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));

    //Manhattan method
    //return Math.abs(eNode.x - nextCoords.x) + Math.abs(eNode.y - nextCoords.y);

    //diagonal distance
    var d_max = Math.max(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));
    var d_min = Math.min(Math.abs(nextCoords.x - eNode.x), Math.abs(nextCoords.y - eNode.y));
    var c_n = 10;
    var c_d = c_n * 1.4141;
    return c_d * d_min + c_n * (d_max - d_min);
  },
  calcGScore: function(nextNode, neighborNum){ //next node is the number 0-7
 /*   if(neighborNum === 0 || neighborNum === 2 || neighborNum === 5 || neighborNum === 7){
      return 14 + nextNode.parent.GScore;
    }
    else return 10 + nextNode.parent.GScore;*/
    return 1 + nextNode.parent.GScore;
  },
  /*nextNode is like this:

    0   1   2
    3  cur  4
    5   6   7 */
  checkIfFree: function(nextCoords){
    var nodeValue;
    if(this.terrainArray[nextCoords.x] === undefined || this.terrainArray[nextCoords.x][nextCoords.y] === undefined){
      nodeValue = undefined;
    }
    else{
      nodeValue = this.terrainArray[nextCoords.x][nextCoords.y];
    }
    if(nodeValue === true || nodeValue === undefined){
      return false;
    }
    else return true;

  },
  getNextNodeCoords: function(cNode, nextNode){
    var nextCoords = {};
    switch(nextNode){
      case 0:
        nextCoords = this.changeNextNodeCoords(cNode, -1, -1);
        break;
      case 1: 
        nextCoords = this.changeNextNodeCoords(cNode, 0, -1);
        break;
      case 2:
        nextCoords = this.changeNextNodeCoords(cNode, 1, -1);
        break;
      case 3:
        nextCoords = this.changeNextNodeCoords(cNode, -1, 0);
        break;
      case 4:
        nextCoords = this.changeNextNodeCoords(cNode, 1, 0);
        break;
      case 5:
        nextCoords = this.changeNextNodeCoords(cNode, -1, 1);
        break;
      case 6:
        nextCoords = this.changeNextNodeCoords(cNode, 0, 1);
        break;
      case 7:
        nextCoords = this.changeNextNodeCoords(cNode, 1, 1);
        break;

    }
    return nextCoords;

  },
  changeNextNodeCoords(cNode, dx, dy){
    var nextCoords = {};
    nextCoords.x = cNode.x + dx;
    nextCoords.y = cNode.y + dy;
    return nextCoords;
  }




}
function moveEntities() {

    for(var entity in entities){
      entity = entities[entity];
      //console.log('************************************');
        if(entity.walking === true){
          //console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
          if(!entity.nextNode){
            entity.nextNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
            entity.walking = false;
          }else if(entity.nextNode.x !== ~~(entity.x / 32) || entity.nextNode.y !== ~~(entity.y / 32)){
            if(~~(entity.x / 32) > entity.nextNode.x){
              entity.x -= 10;
            }else if (~~(entity.x / 32) < entity.nextNode.x){
              entity.x += 10;
            }
            if(~~(entity.y / 32) > entity.nextNode.y){
              entity.y -= 10;
            }else if(~~(entity.y / 32) < entity.nextNode.y){
              entity.y += 10
            }
          }else{

            entity.nextNode = entity.path.pop();

        }
      }
    }

}
    

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 16, y) === true || isBlocked(x, y + 16) === true || isBlocked(x + 16, y + 16) === true) {
        return true;
    }else if(isBlocked(x, y) === undefined || isBlocked(x + 16, y) === undefined || isBlocked(x, y + 16) === undefined || isBlocked(x + 16, y + 16) === undefined){
        return true;
    }else return false;
}

function attackableEntities(entity, entitiesMap){
  //Check if entities on nodes that are within range, then check if they are specifically within range via entity.x/.y
  if(entity.attackType === 'sword'){
    var nearbyEntities = [];
    //console.log('z');
    var nodeX = ~~(entity.x / 32);
    var nodeY = ~~(entity.y / 32);

    for(var i = nodeX - 1; i <= nodeX + 1; i++){

      //console.log('a')
      for(var j = nodeY - 1; j <= nodeY + 1; j++){
        if(!getEntitiesMap(i, j)){
          continue;
        }
              //console.log('b')
        if(entitiesMap[i][j].length > 0){
           //console.log('c')
          var entitiesAtNode = entitiesMap[i][j]
          for(var e in entitiesAtNode){
            //console.log('d')
            var charact = entities[entitiesAtNode[e]];
            if(!charact.dead && charact.playerId !== entity.playerId){ //don't attack yourself, could use this logic to heal
              nearbyEntities.push(charact);
              //console.log('e')
              if(!entity.attacking){
                entity.attacking = true;
              }
            }
          }
        }
      }
    }
  }
/*  console.log('nearbyEntities: ');
  console.log(nearbyEntities);*/
/*  entity.betweenVictims = [];
  entity.gore = {};
  var toDelete = {};
  var found = false;
  if(!entity.nearbyEntities){
    entity.nearbyEntities = nearbyEntities;  //This doesn't need to be this big, if that becomes an issue
  }
  for(var j in entity.nearbyEntities){
    for(var i in nearbyEntities){
      if(entity.nearbyEntities[j].id === nearbyEntities[i].id){
        found = true;
        break;
      }
    }
    if(!found){
      toDelete[entity.nearbyEntities[j].id] = true;
    }
  }
  for(var i in toDelete){
    console.log('i in toDelete loop: ' + i);
    console.log('entity in toDelete loop: ');
    console.log(entity);
    console.log('id: ' + entity.id);

    var cantorNum = cantor(entity.id, i);
   console.log('heeeyo: ' + cantor(entity.id, i));
    console.log('wtf: ' + cantor(0, 1));
    if(controller.particles[cantorNum]){
     controller.particles[cantorNum].stop() //Need to make this right
     delete controller.particles[cantorNum];
    }
  }
  entity.nearbyEntities = nearbyEntities;
*/
  for(var i in nearbyEntities){

    var victim = nearbyEntities[i];
   /* var betweenFighters = {x : (entity.x + nearbyEntities[i].x) / 2, 
                                y : (entity.y + nearbyEntities[i].y) / 2};
   // entity.betweenVictims.push(betweenFighters);
    if(!controller.particles[(cantor(entity.id, victim.id))]){
      controller.init(betweenFighters.x, betweenFighters.y, cantor(entity.id, victim.id));
      entity.gore[nearbyEntities[i].id] = true;
    }
    else if(entity.moved && entity.movedCount > 3){
      controller.particles[cantor(entity.id, victim.id)].stop() //Need to make this right
      delete controller.particles[(cantor(entity.id, victim.id))];
      controller.init(betweenFighters.x, betweenFighters.y,  cantor(entity.id, victim.id));
      entity.gore[nearbyEntities[i].id] = true;
      entity.movedCount = 0;
    }else if(entity.moved){
      entity.movedCount++;
    }*/


    if(!attackEffects[(cantor(entity.id, victim.id))]){
      controller.init(victim.x, victim.y, entity.id, victim.id);
    }
    console.log(victim);
    if(entity.playerId === playerId && !victim.dead){
      var attack = {attacker: {id: entity.id, playerId : entity.playerId},
                  victim: {id : victim.id, playerId : victim.playerId}};



      attacks.push(attack);
    }



  }

 /* for(var effect in attackEffects){
    var goodEffect = false;
    for(var attack in attacks){
      if(effect == cantor(attacks[attack].attacker.id, attacks[attack].victim.id)){
        console.log('goodEffect');
        goodEffect = true;
        break;  //attack exists for an effect
      }
    }
    if(!goodEffect){
      console.log('badEffect');
      attackEffects[effect].stop();
      delete attackEffects[effect];
    }
  }*/
 /* for(effect in attackEffects){
    if(attackEffects[effect].alive  === true){
      attackEffects[effect].alive = false;
    }else{
      attackEffects[effect].stop();
      delete attackEffects[effect];
    }
  }*/


  
}
exports.AI = AI;