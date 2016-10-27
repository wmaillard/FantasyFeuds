function getEntitiesMap(x, y){
    if(x <= entitiesMap.length - 1 && x >= 0 && y <= entitiesMap[x].length - 1 && y >= 0){
        return true;
    }else return false;
}


function deepCloneArray(array){
  var newArray = $.extend(true, [], array);
  newArray.shift().shift();
  return newArray;
}

function limitBackgroundOffset(){
    var returnValue = {x: false, y: false};
    if(backgroundOffset.x > 0){
        backgroundOffset.x = 0
        returnValue.x = true;
    }
    if(backgroundOffset.y > 0 ){
       backgroundOffset.y = 0;
       returnValue.y = true; 
    }
    if($('#gameContainer').width() - backgroundOffset.x * zoom > levelWidth * size * zoom){
         backgroundOffset.x = $('#gameContainer').width() / zoom - levelWidth * size;
         returnValue.x = true;
     }
    if($('#gameContainer').height()- backgroundOffset.y * zoom > levelHeight * size * zoom){
        backgroundOffset.y = $('#gameContainer').height() / zoom - levelHeight * size;
        returnValue.y = true;
    } 
    return returnValue;

}

function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}

function testAttackRange(){
      for(e in entities){
        console.log('\nEntity with id: ' + entities[e].id + 'can attack the following \n')
        attackableEntities(entities[e], entitiesMap)
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function isBlocked(x, y) {
    if(!blockingTerrain[~~(x / 32)] || !blockingTerrain[~~(x / 32)][~~(y / 32)]){
        return false;
    }
    return blockingTerrain[~~(x / 32)][~~(y / 32)];
}
function onlyPlayerEntities(entities, playerId){
    var playerEntities = [];
    for(var entity in entities){
        if(entities[entity].playerId === playerId){
            playerEntities.push(entities[entity]);
        }
    }
    return playerEntities.sort(compare);
}


function cantor(a, b){
  a = Number(a);
  b = Number(b);
  return ~~(1 / 2 * (a+b) * (a+b+1)) + b;
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16), 
        1
    ] : null;
}
function compare(a, b){
    if(a.id < b.id){
        return -1;
    }
    if(a.id > b.id){
        return 1;
    }
    return 0;
}

function isInWindow(x, y){
      if(!canvasWidth || !canvasHeight){
        canvasWidth = $('#gameContainer').width();
        canvasHeight = $('#gameContainer').height();
      }
    if(x + backgroundOffset.x < canvasWidth / zoom && y + backgroundOffset.y < canvasHeight / zoom && x + backgroundOffset.x >= 0 &&  y + backgroundOffset.y >= 0){
        return true;
    }else return false;
}

function getTanDeg(deg) {
  var rad = deg * Math.PI/180;
  return Math.tan(rad);
}


function convertScreenToMapPoint(x, y, zoom) {
    var mapPoint = {
        x: x / zoom - backgroundOffset.x,
        y: y / zoom - backgroundOffset.y
    }
    return mapPoint;
}

function mapToScreenPoint(x, y) {
    var screenPoint = {
        x: x * zoom + backgroundOffset.x * zoom,
        y: y * zoom + backgroundOffset.y * zoom
    }
    return screenPoint;
}


CanvasRenderingContext2D.prototype.drawSafeImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight){
  if(!canvasWidth || !canvasHeight){
    canvasWidth = $('#gameContainer').width();
    canvasHeight = $('#gameContainer').height();
  }
  if (dx  < canvasWidth && dy < canvasHeight && dx >= 0 && dy >= 0)
        this.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}


function createVector(panTime, oldCoords, newCoords){
    var swipeRatio = 0.9;
    var length = Math.sqrt(Math.pow(oldCoords.x - newCoords.x, 2) + Math.pow(oldCoords.y - newCoords.y, 2));
    if(length / panTime > swipeRatio){
            alert('Swipe! length: ' + length + ' time: ' + panTime + 'ms')
    }

}

function entityIsSelected(){
    var selectedEntities = [];
    for(var i in entities){
        if(entities[i].selected === true){
            selectedEntities.push(entities[i])
        }
    }
    return selectedEntities;
}

function LOO(theObject){  //Length of Object
    if(theObject.constructor === Object){
        return Object.keys(theObject).length;
    }else return 0;
}