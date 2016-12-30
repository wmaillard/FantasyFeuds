

function entityIsThere(x, y, rangeX, rangeY) {
    if (rangeX && rangeY) {
        for (var i in entities) {
            var entX = entities[i].x;
            var entY = entities[i].y;
            if (x >= entX && x <= entX + rangeX && y >= entY && y <= entY + rangeY) {
                if (entities[i].playerId === playerId) {
                    entities[i].selected = true;
                }
            }
        }
    } else {
        for (var i in entities) {
            if(entities[i].type){
                var entX = entities[i].x - entities[i].width * entityInfo[entities[i].type].size * .2;
                var entY = entities[i].y;
                if (x >= entX - 16 && x <= entX + 16 && y >= entY - 16 && y <= entY + 16) {
                    return entities[i];
                }
          }
        }
    }
    return false;
}


function setWindowResizeProperties () {
    $("#background").attr("height", window.innerHeight);
    $("#background").attr("width", window.innerWidth);
    $("#foreground").attr("height", window.innerHeight);
    $("#foreground").attr("width", window.innerWidth);
    $("#info").attr("height", window.innerHeight);
    $("#info").attr("width", window.innerWidth);
    $("#explosions").attr("height", window.innerHeight);
    $("#explosions").attr("width", window.innerWidth);
    ctxF = $("#foreground")[0].getContext("2d");
    ctxB = $("#background")[0].getContext("2d");
    ctxI = $("#info")[0].getContext("2d");
    canvasWidth = $('#gameContainer').width();
    canvasHeight = $('#gameContainer').height();
}
