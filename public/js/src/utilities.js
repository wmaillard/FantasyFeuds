function getEntitiesMap(x, y){
    if(x <= entitiesMap.length - 1 && x >= 0 && y <= entitiesMap[x].length - 1 && y >= 0){
        return true;
    }else return false;
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



function createVector(panTime, oldCoords, newCoords){
    var swipeRatio = 0.9;
    var length = Math.sqrt(Math.pow(oldCoords.x - newCoords.x, 2) + Math.pow(oldCoords.y - newCoords.y, 2));
    if(length / panTime > swipeRatio){
            alert('Swipe! length: ' + length + ' time: ' + panTime + 'ms')
    }

}



function entityIsSelected(){
    var sEntities = [];
    for(var i in entities){
        if(entities[i].selected === true){
            sEntities.push(entities[i])
        }
    }
    return sEntities;
}




function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 16, y) === true || isBlocked(x, y + 16) === true || isBlocked(x + 16, y + 16) === true) {
        return true;
    }else if(isBlocked(x, y) === undefined || isBlocked(x + 16, y) === undefined || isBlocked(x, y + 16) === undefined || isBlocked(x + 16, y + 16) === undefined){
        return true;
    }else return false;
}