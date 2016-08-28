//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);



var AI = {
  //A* tutorial: http://www.policyalmanac.org/games/aStarTutorial.html
  //https://en.wikipedia.org/wiki/A*_search_algorithm
  //10 points for adjacent node 14 for diagonal

  //cNode.x, cNode.y, eNode.x, eNode.y, blockingTerrain (true && undefined is blocking)
  drawTestDots: function(blockingTerrain, ctx){
    ctx.clearRect(0, 0, ctxI.canvas.width, ctxI.canvas.height);
    for(var i = 0; i < blockingTerrain.length; i++){
      for(var j = 0; j < blockingTerrain[i].length; j++){
        var color;
        if(blockingTerrain[i][j] === true || blockingTerrain[i][j] === undefined){
          color = 'red';
        }
        else{
          color = 'green';
        }
        var x = ~~((i ) * 32 + 16+ backgroundOffset.x);
        var y = ~~((j )) * 32 + 16+ backgroundOffset.y;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
      }
    }
  },
  AStar: function(cNode, eNode, graph){
    this.closedSet = [];
    this.openSet = [cNode];
    this.cameFrom = [];
    
    while(openSet.length > 0){
      var current = getLowestFScore(this.openSet);
      if(this.openSet[current].x === eNode.x && this.openSet[current].y === eNode.y){
        return this.createPath(cameFrom, this.openSet[current]);
      }
      openSet.splice(current, 1); //take currebbnt out of openSet

      closedSet.push(this.openSet[current]);
      for (var i = 0; i < 8; i++){
        if(this.findInArray(this.getNextNodeCoords(current, i), closedSet) === -1){
          continue;
        }else if(checkIfBlocked(cNode, graph, nextNode))
        var possibleG = current.G + calcGScore(i);
        if(this.findInArray(this.getNextNodeCoords(current, i), openSet) === -1){
          openSet.push(this.getNextNodeCoords(current, i));
        }
        else if(possibleG >= 5){}

      }
    }

  },
  findInArray: function(item, arrayXY){
    for(var i = 0; i < arrayXY.length; i++){
      if(array[i].x === item.x && array[i].y === item.y){
        return i;
      }
    }
    return -1;
  },
  createPath: function(cameFrom, current){

  },
  getLowestFScore: function(openSet){
    var lowest = {};
    lowest.fScore = Number.MAX_SAFE_INTEGER;
    for(var item in openSet){
      if(openSet[item].fScore < lowest.fScore){
        lowest = item;
      }
    }
    return lowest;
  },


  calcHScore: function(nextCoords, eNode){
    return Math.abs(eNode.x - nextCoords.x) + Math.abs(eNode.y - nextCoords.y);
  },
  calcGScore: function(nextNode){ //next node is the number 0-7
    if(nextNode === 0 || nextNode === 2 || nextNode === 5 || nextNode === 7){
      return 14;
    }
    else return 10;
  },
  /*nextNode is like this:

    0   1   2
    3  cur  4
    5   6   7 */
  checkIfBlocked: function(cNode, graph, nextNode){
    var nextCoords = this.getNextNodeCoords(cNode, nextNode);
    var nodeValue = graph[nextCoords.x][nextCoords.y];
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
        nextCoords = this.changeNextNodeCoords(cNode, 0, -1);
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

  },
  changeNextNodeCoords(cNode, dx, dy){
    var nextCoords = {};
    nextCoords.x = cNode.x + dx;
    nextCoords.y = cNode.y + dy;
    return nextCoords;
  }




}
function travelSouth(entity) {

    entity.heading.y = entity.y + 1000;
    if(!entity.intervalSet){
      entity.intervalSet = true;
      setInterval(function() {

              if (shouldGoThere(entity.x, entity.y + 5, entity)) {
                  addAlreadyBeen(entity);
                  entity.y += 5;
                  entity.directionPointing = 'S';

              } else if (shouldGoThere(entity.x + 5, entity.y, entity)) {
                  addAlreadyBeen(entity);
                  entity.x += 5;
                  entity.directionPointing = 'E';
              } else if (shouldGoThere(entity.x, entity.y - 5, entity)) {
                  addAlreadyBeen(entity);
                  entity.y -= 5;
                  entity.directionPointing = 'N';
              } else if (shouldGoThere(entity.x - 5, entity.y, entity)) {
                  addAlreadyBeen(entity);
                  entity.x -= 5;
                  entity.directionPointing = 'W';
              }

          
      }, 250)
  }
}
    
    


function addAlreadyBeen(entity) {
    if (!entity.alreadyBeen[entity.x]) {
        entity.alreadyBeen[entity.x] = [];
    }
    entity.alreadyBeen[entity.x][entity.y] = true;
}

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 18, y) === true || isBlocked(x, y + 18) === true || isBlocked(x + 18, y + 18) === true) {
        return true;
    }else if(isBlocked(x, y) === undefined || isBlocked(x + 32, y) === undefined || isBlocked(x, y + 32) === undefined || isBlocked(x + 32, y + 32) === undefined){
        return true;
    }else return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}

