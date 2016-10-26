
 

 function mapMove(e) {
    //e = switchEventToMobile(e);
    if(e.type === 'panstart'){
        currentCoords.x = e.pointers[0].clientX;
        currentCoords.y = e.pointers[0].clientY;

        $('#gameContainer').css('cursor', 'move');
    }else if(e.type === 'panend'){
        $('#gameContainer').css('cursor', 'default');


    };

    var changeX = Math.abs(e.pointers[0].clientX - currentCoords.x);
    var changeY = Math.abs(e.pointers[0].clientY - currentCoords.y);

  /*  if (fullOnPanning && !panning) {
        fullOnPanning = false;
        scene.load(level, ctxB, zoom);  //Reload, possible fix dragging bug
    }*/

    //if (fullOnPanning || (panning && (changeY > pixelChangeForPan || changeX > pixelChangeForPan))) {

        if(e.pointers[0].ctrlKey){
            //console.log('ctrl down');
            selectMulti(e.clientX, e.clientY, currentCoords.x, currentCoords.y);
            wasCtrl = true;
        }


        else{

            backgroundOffset.x += (e.pointers[0].clientX - currentCoords.x) / zoom;
            backgroundOffset.y += (e.pointers[0].clientY - currentCoords.y) / zoom;


            currentCoords.x = e.pointers[0].clientX;
            currentCoords.y = e.pointers[0].clientY;

            //fullOnPanning = true;
        }
        //click = false;

    //} 

   /* else {
       click = true;  //This means it was a quick click
    }*/

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



//Obsolete
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
        //clickGameContainer(e);
    }

}
//Obsolete
function pressMap(e, mobile) {
   /* console.log("on Press: ");
    console.log(backgroundOffset);*/
    console.log('clicking');

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
    var x = ~~(e.pointers[0].clientX / zoom -  backgroundOffset.x);  //size/2 shifts everything from top left corner to center
    var y = ~~(e.pointers[0].clientY / zoom -  backgroundOffset.y);

    var entityAtClick = entityIsThere(x, y);
    if(entityAtClick && !entityAtClick.dead && entityAtClick.playerId === playerId){ 
        deselectAllEntities();
        selectedEntities[entityAtClick.id] = entityAtClick;
        if(!$('#allEntities').hasClass('buttonDown')){
            $('#allEntities').toggleClass('buttonDown')
        }
        
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
      	
      	//console.log('spot is free');
       	if((Object.keys(selectedEntities).length > 0 && selectedEntities.constructor === Object)){
       		//console.log('there is a selected entity');
       		for(var i in selectedEntities){
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
       				//entity.path = AI.AStar({x: ~~(selectedEntities[i].x / 32), y: ~~(selectedEntities[i].y / 32)}, {x: ~~(x / 32), y: ~~(y / 32)}, blockingTerrain);
                    var coords = {
                        startX: entity.x,
                        startY: entity.y,
                        endX: entity.heading.x,
                        endY: entity.heading.y,
                        id: entity.id
                      }


                        socket.emit('entityPathRequest', coords);
                        //entity.walking = true;
                
                    



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
   // click = true;

  
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
    selectedEntities = {};
}
//not using
function selectMulti(x, y, originalX, originalY){
    ctxI.clearRect(0, 0, $("#info").width(), $("#info").height())
    ctxI.beginPath();
    ctxI.lineWidth="1";
    ctxI.strokeStyle="dark-grey";
    ctxI.globalAlpha=0.2
    ctxI.fillRect(originalX, originalY, x - originalX, y - originalY);
    ctxI.stroke();


}
//not using?
function selectEntities(x, y, oldX, oldY){
    x = ~~(x / zoom - backgroundOffset.x + 16 * zoom);
    y = ~~(y / zoom - backgroundOffset.y + 16 * zoom);
    oldX = ~~(oldX / zoom - backgroundOffset.x + 16 * zoom);
    oldY = ~~(oldY / zoom - backgroundOffset.y + 16 * zoom);
    deselectAllEntities();
    entityIsThere(x, y, x + oldX, y + oldY)
}
//obsolete
function switchEventToMobile(e){
        if(e.originalEvent.changedTouches && e.originalEvent.changedTouches.length === 1){
                e = e.originalEvent.changedTouches[0];
        }
        return e;
}

function selectAllVisiblePlayerEntities(entities, playerId){
    var playersEntities = onlyPlayerEntities(entities, playerId);
    for(e in playersEntities){
        if(isInWindow(playersEntities[e].x, playersEntities[e].y)){
            selectedEntities[playersEntities[e].id] = playersEntities[e];
        }
    }

}

function zoomPanTo(x, y, localZoom, limits){  //x, y is mapX, mapY

    if(limits === undefined){
        limits = {x: false, y: false}
    }
    var point = mapToScreenPoint(x, y, localZoom);
    var midPoint = {x : canvasWidth / 2, y: canvasHeight / 2}; //This is reset on canvas reset.
    var diffX = Math.abs(midPoint.x - point.x);
    var diffY = Math.abs(midPoint.y - point.y);
    var diffRangeX = 100;
    var diffChangeX = 50;
    var diffRangeY = 100;
    var diffChangeY = 50; 
    var stuck = true;
    //We may need to look at the difference between point.x and midpoint.x when point.x is negative, currently ignoring
    while(diffX < diffRangeX && diffX > 5){
        diffRangeX /= 2;
        diffChangeX /= 2;
    }
    while(diffY < diffRangeY && diffY > 5){
        diffRangeY /= 2;
        diffChangeY /= 2;
    }

    if(!limits.x && (diffX > 5 || point.x < 0)){
        stuck = false;
        if(midPoint.x > point.x){
            backgroundOffset.x += diffChangeX;
        }else{
            backgroundOffset.x -= diffChangeX;
        }
    }
    if(!limits.y && (diffY > 5 || point.y < 0)){
        stuck = false;
        if(midPoint.y > point.y){
            backgroundOffset.y += diffChangeY;
        }else{
            backgroundOffset.y -= diffChangeY;
        }
    }
    redrawBackground();
    var oldPoint = point;
    point = mapToScreenPoint(x, y, zoom);
    midPoint = {x : canvasWidth / 2, y: canvasHeight / 2}; //This is reset on canvas reset.

    diffX = Math.abs(midPoint.x - point.x);
    diffY = Math.abs(midPoint.y - point.y);

    var newLimits = limitBackgroundOffset();
    if(newLimits.x === true){
        limits.x = true;
    }
    if(newLimits.y === true){
        limits.y = true;
    }


    if(!stuck && !(limits.x && limits.y) && (diffX > 5 || diffY > 5 || point.x < 0 || point.y < 0)){
        setTimeout(function(){
            zoomPanTo(x, y, zoom, limits)}, 1000 / 30);
    }else if(zoom < 1){
        setTimeout(function(){
            zoomToOne(x, y);
        })
    }


}

//Does not work with final zoom for zooming in right now
function zoomToOne(x, y, finalZoom){
    var scale = 2;
    if(!finalZoom){
        finalZoom = 1;
    }
    if(finalZoom < 1){
        scale = .5;
    }
    var point = mapToScreenPoint(x, y);
    zoomAction({scale: scale, center: point});

    if(scale > 1){
        if(zoom < 1){
            setTimeout(function(){
                zoomToOne(x, y, finalZoom);
            }, 1000 / 30)
        }
    }else{
        if(zoom > finalZoom){
            setTimeout(function(){
                    zoomToOne(x, y, finalZoom);
            }, 1000 / 30)
        }
    }

}

function goToNextEntity(){
    var playerEntities = onlyPlayerEntities(entities, playerId);
    var index = -1;
    for(var i in playerEntities){
        if(playerEntities[i].id === currentEntity){
            index = i;
            break;
        }
    }
    if(index === -1){
        if(playerEntities.length === 0){
            return -1;
        }else index = 0;
    }
    index++;
    if(index === playerEntities.length){
        index = 0;
    }

    var nextEntity = playerEntities[index];
    currentEntity = nextEntity.id;

    zoomPanTo(nextEntity.x, nextEntity.y, zoom);
}

function goToPreviousEntity(){
    var playerEntities = onlyPlayerEntities(entities, playerId);
    var index = -1;
    for(var i in playerEntities){
        if(playerEntities[i].id === currentEntity){
            index = i;
            break;
        }
    }
    if(index === -1){
        if(playerEntities.length === 0){
            return -1;
        }else index = 0;
    }
    index--;

    if(index < 0){
        index = playerEntities.length - 1;
    }

    var nextEntity = playerEntities[index];
    currentEntity = nextEntity.id;

    zoomPanTo(nextEntity.x, nextEntity.y, zoom);
}


