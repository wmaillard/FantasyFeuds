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