

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

    if ((panning && (changeY > 3 || changeX > 3)) || fullOnPanning) {

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

    currentCoords.x = e.clientX ;
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

      var x = ~~(e.clientX / zoom -  backgroundOffset.x);  //size/2 shifts everything from top left corner to center
      var y = ~~(e.clientY / zoom -  backgroundOffset.y);

    var entityAtClick = entityIsThere(x, y);
    if(entityAtClick && entityAtClick.playerId === playerId){ 
        deselectAllEntities();
        entityAtClick.selected = true;
      }
    else if(boughtEntity){
            var entity;
            entity = new Entity({
                'x': x,
                'y': y
            }, 90, boughtEntity, playerId, playerColor);

            //shift left a bit
            entity.x += entity.width * .20;
            entities.push(entity);
            boughtEntity = null;
    }
      else if(!entityIsBlocked(x, y)){ 
      	var selectedEntities = entityIsSelected();
      	console.log('spot is free');
       	if(selectedEntities.length > 0){
       		console.log('there is a selected entity');
       		for(var i = 0; i < selectedEntities.length; i++){
       			/*console.log('x:', ~~(x / 32), 'ex:', ~~(selectedEntities[i].x / 32));
       			console.log('y:', ~~(y / 32), 'ey', ~~(selectedEntities[i].y / 32));*/
       			selectedEntities[i].walking = true;
       			if(debugPathfinding){
					selectedEntities[i].path = AI.drawTestDots({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain, ctxI);
       			}
       			else{
       				selectedEntities[i].path = AI.AStar({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain);
                    
       			}
       			//console.log(selectedEntities[i].path);
       		}
       		}

       	



    }else{
	$('gameContainer').css( 'cursor', 'not-allowed' );
	setTimeout(function(){$('gameContainer').css( 'cursor', 'default' ); }, 500);
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
            var entX = entities[i].x - entities[i].width * entitySize * .2;
            var entY = entities[i].y;
            console.log('entX:', entX, 'x:', x);
            console.log('enty:', entY, 'y:', y);
            if(x  >= entX - 16 && x <= entX + 16 && y >= entY - 16 && y <= entY + 16){
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
