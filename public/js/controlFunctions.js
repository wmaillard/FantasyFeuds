var panning = false;  //Is the mouse held down?
var fullOnPanning = false;  //Is the mouse held down and has it moved over 5px?
var zoomHappened = false;
var click = true;  //Was it a quick click?
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
        e = switchEventToMobile(e);

    var changeX = Math.abs(e.clientX - currentCoords.x);
    var changeY = Math.abs(e.clientY - currentCoords.y);

    if (fullOnPanning && !panning) {
        fullOnPanning = false;
    }

    if ((panning && (changeY > 1 || changeX > 1)) || fullOnPanning) {

        if(e.ctrlKey){
            console.log('ctrl down');
            selectMulti(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
            wasCtrl = true;
        }


        else{
            backgroundOffset.x += e.clientX - currentCoords.x;
            backgroundOffset.y += e.clientY - currentCoords.y;

            currentCoords.x = e.clientX;
            currentCoords.y = e.clientY;
            if ($('#gameContainer').css('cursor') != 'move') {
                $('#gameContainer').css('cursor', 'move');
            }
            fullOnPanning = true;
        }
        click = false;

    } 

    else {
       click = true;  //This means it was a quick click
    }

}

function releasePressMap(e, mobile) {
        e = switchEventToMobile(e);

    panning = false;
    fullOnPanning = false;

    $('#gameContainer').css('cursor', 'auto');
    
    if(wasCtrl){
        ctxI.clearRect(0, 0, $("#info").width(), $("#info").height())
        selectEntities(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
        wasCtrl = false;
    }
    if(click){
        clickGameContainer(e);
    }

}

function pressMap(e, mobile) {
    e = switchEventToMobile(e);

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
function entityIsSelected(){
	var selectedEntities = [];
	for(var i = 0; i < entities.length; i++){
		if(entities[i].selected === true){
			selectedEntities.push(entities[i])
		}
	}
	return selectedEntities;
}
function clickGameContainer(e){

      var x = ~~(e.clientX / zoom - backgroundOffset.x);
      var y = ~~(e.clientY / zoom - backgroundOffset.y);

      var entityAtClick = entityIsThere(x, y);
      if(entityAtClick){ 
        deselectAllEntities();
        entityAtClick.selected = true;
      }
      else if(!entityIsBlocked(x, y)){ 
      	var selectedEntities = entityIsSelected();
      	console.log('spot is free');
       	if(selectedEntities.length > 0){
       		console.log('there is a selected entity');
       		for(var i = 0; i < selectedEntities.length; i++){
       			console.log('x:', ~~(x / 32), 'ex:', ~~(selectedEntities[i].x / 32));
       			console.log('y:', ~~(y / 32), 'ey', ~~(selectedEntities[i].y / 32));
       			selectedEntities[i].walking = true;
       			selectedEntities[i].path = AI.AStar({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain, ctxI);
       			console.log(selectedEntities[i].path);
       		}
       	}

       	else{


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

    }
    click = true;

  
          

  
   
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
    x = ~~(x / zoom - backgroundOffset.x + 16 * zoom);
    y = ~~(y / zoom - backgroundOffset.y + 16 * zoom);
    oldX = ~~(oldX / zoom - backgroundOffset.x + 16 * zoom);
    oldY = ~~(oldY / zoom - backgroundOffset.y + 16 * zoom);
    deselectAllEntities();
    entityIsThere(x, y, x + oldX, y + oldY)
}
function switchEventToMobile(e){
        if(e.originalEvent.changedTouches){
                e = e.originalEvent.changedTouches[0];
        }
        return e;
}
