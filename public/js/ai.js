// global variables added
var entities = []; // changed from {} to allow .push()
var heroes = []; // for future use; it seems only square braces work with push
var enemies = []; // for future use
var pathEnd = new Path(0, 0); 
var pathStart = new Path(0, 0); 
var path = []; 



function startLevel(){
  
  var hero1 = new Entity({'x': 547, 'y': 237}, "img/characters/giant.png", 100);
  

  //entities[hero1.id] = hero1;
  //hero1.current = true;
  // for future: on click set all hearoes to false? or on double-click
  entities.push(hero1);

  // heroes[hero1.id] = hero1;  ***Must change in drawEntities if want to use

  $('#gameContainer').click(function(e){
    var x = ~~((e.clientX - backgroundOffset.x) / zoom);
    var y = ~~((e.clientY - backgroundOffset.y) / zoom)

//    var giant = new Entity({'x': x, 'y': y}, "img/characters/giant.png", 100);
//    entities[giant.id] = giant;   *** add back in ^
//    travelSouth(giant);           *** add back in

    pathEnd.x = x;
    pathEnd.y = y;

    console.log(pathEnd.x);
    console.log(pathEnd.y);
    
    for (var h = 0; h < entities.length; h++){ // changed heroes to entities
      if (~~(entities[h].x / 32) === ~~(x / 32) && ~~(entities[h].y / 32) === ~~(y /32)){  // changed heroes -> entities
        entities[h].current = true; 
        console.log(entities[h]);
        //return;
      }
    }

    // if no hero is selected, do nothing
    if (get_current_hero() === "None"){
        var doNothing = 0;
    }

    else{
      //for (var i = 0; i < enemies.length; i++){
         // if (enemies[i].x === xPosition && enemies[i].y === yPosition){
         //   var doNothing = 0;
          // call move_hero and start fighting
         // }
     // }
         // else{
        
          move_hero();
          //}
      }  
    



})
  var mapHeight, mapWidth, canvasHeight, canvasWidth, mapYOffset, mapXOffset;

  
  $("#background").attr("height", $("#gameContainer").height());
  $("#background").attr("width", $("#gameContainer").width());
  $("#foreground").attr("height", $("#gameContainer").height());
  $("#foreground").attr("width", $("#gameContainer").width());
  var ctxB = $("#background")[0].getContext("2d");
  var ctxF = $("#foreground")[0].getContext("2d");


  

  var i = 0;
  ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics
  
  scene.load(level, ctxB, zoom);
 // backgroundChange = false;

  var entityTrack = 0;
  setInterval(function(){
    entityTrack++;
 // limitBackgroundOffset();
    if(fullOnPanning || zoomHappened){
      scene.load(level, ctxB, zoom);
      drawEntities(entities, ctxF, true);
      zoomHappened = false;
     // backgroundChange = false;
    }
    else if(entityTrack % entitySpeed === 0){ //simple way to animate entities, should be a better way (else if, entities are frozen when pan)
        drawEntities(entities, ctxF);
  }

   }, 1000 / fps);  
}



function move_hero(){
  generateDijkstraGrid();
  var curHero = get_current_hero();
  pathStart.x = ~~(curHero.x / 32);
  pathStart.y = ~~(curHero.y / 32);

  var currentWeight = dijkstraGrid[pathStart.x][pathStart.y];
  if (currentWeight === null || currentWeight === Number.MAX_VALUE) {
    return;
  }

  path.push(pathStart);

  var at = pathStart;
  while (at.x != pathEnd.x || at.y != pathEnd.y) {
     currentWeight = dijkstraGrid[at.x][at.y];

    var neighbors = neighborsOf(at);
    var next = null;
    var nextWeight = currentWeight;

    //Take the first neighbor that has lower weight than our current position
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      var neighborWeight = dijkstraGrid[neighbor.x][neighbor.y];
      if (neighborWeight < nextWeight) {
        next = neighbor;
        nextWeight = neighborWeight;

      }
    }

  // need to add case where enemie is encountered 

  // make sure the hero is oriented the right way
  
    if (next.x < at.x && next.y === at.y){
      curHero.directionPointing = 'N';
      curHero.x = (next.x * 32);
      curHero.y = (next.y * 32);
    }
    else if (next.x > at.x && next.y === at.y){
      curHero.directionPointing = 'S';
      curHero.x = (next.x * 32);
      curHero.y = (next.y * 32);
    }
    else if (next.x === at.x && next.y > at.y){
      curHero.directionPointing = 'E';
      curHero.x = (next.x * 32);
      curHero.y = (next.y * 32);
    }
    else if(next.x === at.x && next.y < at.y){
      curHero.directionPointing = 'W';
      curHero.x = (next.x * 32);
      curHero.y = (next.y * 32);
    }
  
    //curHero.x = (next.x * 32);
    //curHero.y = (next.y * 32);
    console.log(curHero.x);
    console.log(curHero.y);
    path.push(next);
    at = next;

  }

}


function get_current_hero(){  // (heroes)
  for (var i = 0; i < entities.length; i++){ //changed heroes -> entities
    if (entities[i].current === true){ // changed heroes to entities
      return entities[i]; // changed heroes to entities
    }
  }
  return "None";
}



function generateDijkstraGrid() {
  //Generate an empty grid, set all places as weight null, which will stand for unvisited
  dijkstraGrid = new Array(levelWidth);
  for (var x = 0; x < levelWidth; x++) {
    var arr = new Array(levelHeight);
    for (var y = 0; y < levelHeight; y++) {
      arr[y] = null;
    }
    dijkstraGrid[x] = arr;
  }

  //Set all places where blockages are as being weight MAXINT (need a library for this?), which will stand for not able to go here
  for (var i = 0; i < blockingTerrain.length; i++) {
    for (var j = 0; j < blockingTerrain[i].length; j++){
      if(blockingTerrain[i][j] === true){
        var t = new Path(i, j); // blockingTerrain[i];
        dijkstraGrid[t.x][t.y] = Number.MAX_VALUE;
      }
    }
  }

  //flood fill out from the end point
  pathEnd.distance = 0;
  pathEnd.x = ~~(pathEnd.x / 32);
  pathEnd.y = ~~(pathEnd.y / 32);
  dijkstraGrid[pathEnd.x][pathEnd.y] = 0;
  var toVisit = [pathEnd];

  //for each node we need to visit, starting with the pathEnd
  for (i = 0; i < toVisit.length; i++) {
    var neighbors = neighborsOf(toVisit[i]);

    //for each neighbor of this node (only straight line neighbors, not diagonals)
    for (var j = 0; j < neighbors.length; j++) {
      var n = neighbors[j];

      //We will only ever visit every node once as we are always visiting nodes in the most efficient order
      if (dijkstraGrid[n.x][n.y] === null) {  // [n.x][n.y]
        n.distance = toVisit[i].distance + 1;
        dijkstraGrid[n.x][n.y] = n.distance; // [n.x][n.y]
        toVisit.push(n);
      }
    }
  } 
}




function Path(newX, newY){
  this.x = newX;
  this.y = newY;
  this.distance = 0;

}



function neighborsOf(v){
  var res = [];

  if (v.x > 0) {
    res.push(new Path(v.x - 1, v.y));
  }
  if (v.y > 0) {
    res.push(new Path(v.x, v.y - 1));
  }

  if (v.x < levelWidth - 1) {
    res.push(new Path(v.x + 1, v.y));
  }
  if (v.y < levelHeight - 1) {
    res.push(new Path(v.x, v.y + 1));
  }

  return res;
}