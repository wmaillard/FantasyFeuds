//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);

function isBlocked(x, y) {

    return blockingTerrain[~~(x / 32)][~~(y / 32)];

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
    }
    return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}

