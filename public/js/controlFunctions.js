
 

 function mapMove(e, mobile) {
    e = switchEventToMobile(e);

    var changeX = Math.abs(e.clientX - currentCoords.x);
    var changeY = Math.abs(e.clientY - currentCoords.y);

    if (fullOnPanning && !panning) {
        fullOnPanning = false;
        scene.load(level, ctxB, zoom);  //Reload, possible fix dragging bug
    }

    if (fullOnPanning || (panning && (changeY > pixelChangeForPan || changeX > pixelChangeForPan))) {

        if(e.ctrlKey){
            //console.log('ctrl down');
            selectMulti(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
            wasCtrl = true;
        }


        else{
            backgroundOffset.x += (e.clientX - currentCoords.x) / zoom;
            backgroundOffset.y += (e.clientY - currentCoords.y) / zoom;

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
function createVector(panTime, oldCoords, newCoords){
    /*console.log('old: ')
    console.log(oldCoords);
    console.log('new: ');
    console.log(newCoords);*/
    var length = Math.sqrt(Math.pow(oldCoords.x - newCoords.x, 2) + Math.pow(oldCoords.y - newCoords.y, 2));
	if(length / panTime > swipeRatio){
    		alert('Swipe! length: ' + length + ' time: ' + panTime + 'ms')
	}

}
var oldBackgroundOffset = {};
oldBackgroundOffset.x =    backgroundOffset.x;
oldBackgroundOffset.y = backgroundOffset.y;

function releasePressMap(e, mobile) {
    /*console.log("on release: ");
    console.log(backgroundOffset);*/
    lockOldBO = false;

/*    var d = new Date; //Swipe test is here, swipping
    panTime = d.getTime() - panTime;

    createVector(panTime, oldBackgroundOffset, backgroundOffset);*/ 



    oldBackgroundOffset.x = backgroundOffset.x;
    oldBackgroundOffset.y = backgroundOffset.y;



    e = switchEventToMobile(e);

    panning = false;
    fullOnPanning = false;
    scene.load(level, ctxB, zoom);  //Reload, possible fix dragging bug

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
   /* console.log("on Press: ");
    console.log(backgroundOffset);*/

    var d = new Date;
    panTime = d.getTime();
    

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
	for(var i in entities){
		if(entities[i].selected === true){
			selectedEntities.push(entities[i])
		}
	}
	return selectedEntities;
}
function clickGameContainer(e){

   // console.time('clickGameContainer');
      var x = ~~(e.clientX / zoom -  backgroundOffset.x);  //size/2 shifts everything from top left corner to center
      var y = ~~(e.clientY / zoom -  backgroundOffset.y);

    var entityAtClick = entityIsThere(x, y);
    if(entityAtClick && !entityAtClick.dead && entityAtClick.playerId === playerId){ 
        deselectAllEntities();
        entityAtClick.selected = true;
      }
    else if(boughtEntity){
        var entity;
	    var health = 100;

 
            entity = new Entity({
                'x': x,
                'y': y
            }, health, boughtEntity, playerId, playerColor);

            //shift left a bit
            entity.x += zoom * entity.width * .1;
            entity.y -= (zoom - 1) * entity.width * .4;
  		 	socket.emit('addEntity', {entity: entity});
            //entities.push(entity);
            boughtEntity = false;
    }
      else if(!entityIsBlocked(x, y)){ 
      	var selectedEntities = entityIsSelected();
      	//console.log('spot is free');
       	if(selectedEntities.length > 0){
       		//console.log('there is a selected entity');
       		for(var i = 0; i < selectedEntities.length; i++){
                var entity = selectedEntities[i];
                entity.path = []; //kill path early
       			/*console.log('x:', ~~(x / 32), 'ex:', ~~(selectedEntities[i].x / 32));
       			console.log('y:', ~~(y / 32), 'ey', ~~(selectedEntities[i].y / 32));*/
       			entity.walking = true;
                entity.heading = {};
                entity.heading.x = x;
                entity.heading.x += entity.width * .1;
                entity.heading.y = y;
                entity.heading.y -= (zoom - 1) * entity.width * .4;
                
       			if(debugPathfinding){
					selectedEntities[i].path = AI.drawTestDots({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain, ctxI);
       			}
       			else{
       				entity.path = AI.AStar({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain);
				    socket.emit('entityPath', {id : entity.id, path : entity.path, heading : entity.heading});
                    if(entity.path && entity.path.length > 0){
                        entity.walking = true;
                    }



       			}
       			//console.log(selectedEntities[i].path);
       		}
       		}

       	



    }else{
	$('#gameContainer').css( 'cursor', 'not-allowed' );
	/*if (navigator.vibrate) {
		navigator.vibrate(125); //getting called by pan
	}*/
	setTimeout(function(){$('#gameContainer').css( 'cursor', 'default' ); }, 125);
    }
    click = true;

  
    oldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));
    //can I send oldEntities instead of onlyPlayerEntities
    /*socket.emit('clientEntities', {entities: onlyPlayerEntities(entities, playerId), attacks: attacks});
    attacks = [];*/
        //console.timeEnd("clickGameContainer");

  
   
}

function entityIsThere(x, y, rangeX, rangeY){ //This does testing if something is there and selecting, separate yo!
    if(rangeX && rangeY){
        for(var i in entities){
            var entX = entities[i].x;
            var entY = entities[i].y;
            if(x >= entX && x <= entX + rangeX && y >= entY && y <= entY + rangeY){
                    if(entities[i].playerId === playerId){
                        entities[i].selected = true;
                    }
            }
        }
    }
    else{
        for(var i in entities){
            var entX = entities[i].x - entities[i].width * entitySize * .2;
            var entY = entities[i].y;
           /* console.log('entX:', entX, 'x:', x);
            console.log('enty:', entY, 'y:', y);*/
            if(x  >= entX - 16 && x <= entX + 16 && y >= entY - 16 && y <= entY + 16){
                return entities[i];
            }
        }
    }
    return false;
}

function deselectAllEntities(){
    for(var i in entities){
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
        if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length === 1){
                e = e.originalEvent.changedTouches[0];
        }
        return e;
}
