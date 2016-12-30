var AI = {
  //A* tutorial: http://www.policyalmanac.org/games/aStarTutorial.html
  //https://en.wikipedia.org/wiki/A*_search_algorithm
  //10 points for adjacent node 14 for diagonal


  maxMS: 50,
  AStar: function(startNode, eNode, blockingTerrain, max){  //This takes about  6 ms right now, pretty good!
    if(max){
      this.maxMS = max;
    }else{
      this.maxMS = 50;
    }
    if(blockingTerrain[startNode.x][startNode.y] || blockingTerrain[eNode.x][eNode.y]){
      return [];
    }
    /*if(Math.sqrt(Math.pow(startNode.x - eNode.x, 2) + Math.pow(startNode.y - eNode.y, 2)) > AI.distanceLimit){
      return [];
    }*/
    this.terrainArray = blockingTerrain;
    this.closedSet = [];
    this.openSet = [];
    var cNode = startNode;
    cNode.GScore = 0;
    cNode.HScore = this.calcHScore(cNode, eNode);
    cNode.FScore = startNode.GScore + cNode.HScore;
    this.openSet.push(cNode);
    var time = Date.now();


    do{
      if(Date.now() > time + this.maxMS){  //trying to do 100 requests a second
        //console.log('Error: Pathfinding was too slow');
        return [];
      }
      cNode = this.getLowestFScore(this.openSet);
      this.addNonBlockedNeighborsToOpen(cNode, eNode);
      var index = this.findInArray(cNode, this.openSet);

      if(index === -1){
        //console.log('did not find cNode in openSet')
        break;
      }
      this.openSet.splice(index, 1); //get rid of cNode
      this.closedSet.push(cNode);

      if(cNode.x === eNode.x && cNode.y === eNode.y){
        //console.log('found end');
        var path = this.drawPath(cNode, startNode);
        /*if(path.length < Math.abs(startNode.x - eNode.x) || path.length < Math.abs(startNode.y - eNode.y)){
          console.log('Error: Incorrect path')
          return [];
        }*/
        path.pop(); //remove current node
        return path;
      }

    }while(this.openSet.length > 0)
    //console.log('Error: No path was found');
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
  },
  

}








    

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 16, y) === true || isBlocked(x, y + 16) === true || isBlocked(x + 16, y + 16) === true) {
        return true;
    }else if(isBlocked(x, y) === undefined || isBlocked(x + 16, y) === undefined || isBlocked(x, y + 16) === undefined || isBlocked(x + 16, y + 16) === undefined){
        return true;
    }else return false;
}

function attackableEntities(entity, entitiesMap){
  if(entity.attackType === 'sword' && !entity.dead){
    var nearbyEntities = [];
    var nodeX = ~~(entity.x / 32);
    var nodeY = ~~(entity.y / 32);

    for(var i = nodeX - 1; i <= nodeX + 1; i++){

      for(var j = nodeY - 1; j <= nodeY + 1; j++){
        if(!getEntitiesMap(i, j)){
          continue;
        }
        if(entitiesMap[i][j].length > 0){
          var entitiesAtNode = entitiesMap[i][j]
          for(var e in entitiesAtNode){
            var charact = entities[entitiesAtNode[e]];
            if(!charact.dead && charact.team !== entity.team){ //don't attack yourself, could use this logic to heal
              nearbyEntities.push(charact);
              if(!entity.attacking){
                entity.attacking = true;
              }
            }
          }
        }
      }
    }
  }


  for(var i in nearbyEntities){

    var victim = nearbyEntities[i];


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



  
}