var panning = false;  //Is the mouse held down?
var fullOnPanning = false;  //Is the mouse held down and has it moved over 5px?
var zoomHappened = false;
var click = false;  //Was it a quick click?
var size = 32;  //Get rid of this magic number
var wasCtrl = false;

var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Default offset view of map

var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning
 

 function mapMove(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }

    var changeX = Math.abs(e.clientX - currentCoords.x);
    var changeY = Math.abs(e.clientY - currentCoords.y);

    if (fullOnPanning && !panning) {
        fullOnPanning = false;
    }

    if ((panning && (changeY > 5 || changeX > 5)) || fullOnPanning) {

        if(e.ctrlKey){
            console.log('ctrl down');
            selectMulti(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
            wasCtrl = true;
            click = false;
        }


        else{
            click = false;
            backgroundOffset.x += e.clientX - currentCoords.x;
            backgroundOffset.y += e.clientY - currentCoords.y;

            currentCoords.x = e.clientX;
            currentCoords.y = e.clientY;
            if ($('#gameContainer').css('cursor') != 'move') {
                $('#gameContainer').css('cursor', 'move');
            }
            fullOnPanning = true;
        }

    } 

    else {
       click = true;  //This means it was a quick click

    }

}

function releasePressMap(e, mobile) {
    panning = false;
    fullOnPanning = false;

    $('#gameContainer').css('cursor', 'auto');
    
    if(wasCtrl){
        ctxI.clearRect(0, 0, $("#info").width(), $("#info").height())
        selectEntities(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
        wasCtrl = false;
    }

}

function pressMap(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }
    currentCoords.x = e.clientX;
    currentCoords.y = e.clientY;
    ////console.log(isBlocked(~~((currentCoords.x - backgroundOffset.x) / zoom),
    //~~((currentCoords.y - backgroundOffset.y) / zoom)));
    panning = true;
}

function zoomIn() {
    zoom = zoom + .25;
    zoomHappened = true;
    clearBackground = true;
}

function zoomOut() {
    zoom = zoom - .25;
    zoomHappened = true;
    clearBackground = true;
}


function kill(){ //Incase the program is out of control
    entities = [];
}

function clickGameContainer(e){
 
   if (click) {
      var x = ~~(e.offsetX / zoom - backgroundOffset.x);
      var y = ~~(e.offsetY / zoom - backgroundOffset.y);

      var entityAtClick = entityIsThere(x, y);
      if(entityAtClick){
        deselectAllEntities();
        entityAtClick.selected = true;
      }
      else if(!entityIsBlocked(x, y)){
        var entity;
        if (Math.floor(Math.random() * 2) === 0) { //50 50 chance
            entity = new Entity({
                'x': x,
                'y': y
            }, "img/characters/giant.png", 75);

        } else {
            entity = new Entity({
                'x': x,
                'y': y
            }, "img/characters/soldier.png", 25);
            entity.isHero = true;
        }
        travelSouth(entity);
        entities.push(entity);

    }
    click = false;

  }
          

  
   
}

function entityIsThere(x, y, rangeX, rangeY){
    if(rangeX && rangeY){
        for(var i = 0; i < entities.length; i++){
            var entX = entities[i].x;
            var entY = entities[i].y;
            if(x >= entX && x <= entX + rangeX && y >= entY && y <= entY + rangeY){
                entities[i].selected = true;
            }
        }
    }
    else{
        for(var i = 0; i < entities.length; i++){
            var entX = entities[i].x;
            var entY = entities[i].y;
            if(x >= entX && x <= entX + size && y >= entY - size / 2 && y <= entY + size){
                return entities[i];
            }
        }
    }
    return false;
}

function deselectAllEntities(){
    for(var i = 0; i < entities.length; i++){
        entities[i].selected = false;
    }
}

function selectMulti(x, y, originalX, originalY){
    ctxI.clearRect(0, 0, $("#info").width(), $("#info").height())
    ctxI.beginPath();
    ctxI.lineWidth="1";
    ctxI.strokeStyle="dark-grey";
    ctxI.globalAlpha=0.2
    ctxI.fillRect(originalX, originalY, x - originalX, y - originalY);
    ctxI.stroke();


}

function selectEntities(x, y, oldX, oldY){
    x = ~~(x / zoom - backgroundOffset.x);
    y = ~~(y / zoom - backgroundOffset.y);
    oldX = ~~(oldX / zoom - backgroundOffset.x);
    oldY = ~~(oldY / zoom - backgroundOffset.y);
    deselectAllEntities();
    entityIsThere(x, y, x + oldX, y + oldY)
}