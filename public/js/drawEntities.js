
var castleRadius = 2500;

function drawCastleCircles(castles, ctx){

  for(var i in castles){
	  ctx.save();
	  ctx.lineWidth = 7 * zoom;
	  ctx.globalAlpha = .6; //opacity
	  ctx.beginPath();
	  ctx.ellipse((castles[i].x + backgroundOffset.x) * zoom,  (castles[i].y + backgroundOffset.y) * zoom, (castleRadius / 2.5) * zoom, (castleRadius / 3) * zoom, 0, 0, Math.PI*2);
	  ctx.strokeStyle = castles[i].color;
	  ctx.stroke();
	  ctx.restore();
  }
	
	
}


function drawEntities(entities, ctx, lock, clear) { 
    //Lets just do this if there was a change, or does it matter.  There probably will always be a change...



      var directions = {
        'S': 0,
        'W': 1,
        'E': 2,
        'N': 3
    }

/* var scratchCanvas = ctx.canvas.cloneNode();    
 scratchCanvas = scratchCanvas.getContext("2d");
    scratchCanvas.canvas.height = levelHeight * 32;  //Right now we are drawing the entire level worth of entities, then cutting a piece of that, super wasteful
    scratchCanvas.canvas.width = levelWidth * 32 ;*/
    
   for(var a in attackEffects){
      if(!attackEffects[a].active){
        delete attackEffects[a];
      }
    }	
	if(!canvasWidth || !canvasHeight || windowResize){
	    canvasWidth = $('#gameContainer').width();
	    canvasHeight = $('#gameContainer').height();
	  }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var entity in entities) {
        
	if(!isInWindow(entities[entity].x, entities[entity].y)){
		continue;
	}


        var type = entities[entity].type;

        if(!entityInfo[type]){
          return;  //Takes care of race conditions when loading
        }
        var img_x = entities[entity].walkingState * entityInfo[type].width;
        var img_y = directions[entities[entity].directionPointing] * entityInfo[type].height;
        //animateEntity(entities[entity]);


        var x, y, nodeX, nodeY;
        x = entities[entity].x;
        y = entities[entity].y;
        nodeX = ~~(x / size);
        nodeY = ~~(y / size);
        
        entities[entity].moved = setNodeXY(entities[entity], entitiesMap,  entitiesLastNode);  //need to store last node and need to run this every time we get new entities with if(lastNode !== currentNode)
        


			var whichImage = entities[entity].type;
			if(entities[entity].dead || (entities[entity].attacking && entities[entity].walkingState !== 2)){
				whichImage += 'Pose';
			}
          
      cutOutCharacter(newCan, characterImages[whichImage], img_x, img_y, entityInfo[type].width, entityInfo[type].height, entities[entity]);
			if(!entities[entity].dead){  
				drawHealthBar(entities[entity], newCan);
			}

        // scaleDown(newCan, 32, 32);
          ctx.drawSafeImage(newCan, 0, 0, newCan.width, newCan.height,  x * zoom + backgroundOffset.x * zoom - size * zoom, y * zoom + backgroundOffset.y * zoom - size * zoom, newCan.width * entitySize * zoom, newCan.height * entitySize * zoom);
         //ctx.drawImage(newCan, 300, 200);
        //  ctx.drawImage(newCan, 0, 0, 32, 32,  x - backgroundOffset.x, y - backgroundOffset.y, 32, 32);  //This is going from 150 to 32

        



  /*        if (!clear) {
             ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
          }*/



              //Here you are upscaling everything in scratchCanvas so it probably looks shitty. Draw the scratch canvas at the correct zoom and then draw it on ctx dumbass, heh heh heh
            // This was the original one: ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, -16 * zoom,  -16 * zoom, $('#background').width(), $('#background').height())

            //ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())

    }
	drawCastleCircles(castles, ctx);
}

function cutOutCharacter(newCan, img, x, y, width, height, entity){
	newCan.width = width;
	newCan.height = height * 2;
	var ctx = newCan.getContext('2d');
  if(entity.selected === true){  
        //void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
        drawHighlight(entity, newCan);
  }
	ctx.drawImage(img, x, y, width, height, 0 , height * .5, width, height);
	return newCan;
	
	
}   
function scaleDown(justCharacter, height, width){
	
	var scalingCanvas = document.createElement('canvas');
	var oldHeight, oldWidth;
	oldHeight = justCharacter.height;
	oldWidth = justCharacter.width;
	

	scalingCanvas.width = oldWidth;
	scalingCanvas.height = oldHeight;
	var ctx = scalingCanvas.getContext('2d');

	ctx.drawImage(justCharacter, 0, 0, oldWidth, oldHeight);
	
	while(oldWidth > width * 2 && oldHeight > height * 2){
		oldWidth /= 2;
		oldHeight /= 2;
		//ctx.clearRect(0, 0, scalingCanvas.width, scalingCanvas.height);
		ctx.drawSafeImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, oldWidth/2, oldHeight/2);
	}
	justCharacter.height = height;
	justCharacter.width = width;
	var finalCtx = justCharacter.getContext('2d');
	finalCtx.clearRect(0, 0, justCharacter.width, justCharacter.height);
	finalCtx.drawSafeImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
}



/*
function entityIsOnEntityMap(entity, entityMap){
    var node = entityMap[entity.nodeX][entity.nodeY];
    for(var e in node){
        if(node[e].id === entity.id){
            return true;
        }
    }
    return false;
}
function updateEntityMap(entity, oldNode, newNode, entitiesMap){
    if(oldNode){
        var index = 0;
        var deleteCount = 0;
        for(var i in entitiesMap[oldNode.x][oldNode.y]){
            if(entitiesMap[oldNode.x][oldNode.y][i].id === entity.id){
                console.log('found an entity in entitiesMap');
                deleteCount = 1;
                index = i;
                break;
            }
        }
        console.log('splicing');
        entitiesMap[oldNode.x][oldNode.y].splice (index, deleteCount);
    }
    if(newNode){
        console.log('newNode');
        entitiesMap[newNode.x][newNode.y].push(entity);
    }
}*/
function setNodeXY(entity, entitiesMap,  entitiesLastNode){
   

    var newX = ~~(entity.x / 32);
    var newY = ~~(entity.y / 32);
    if(entitiesLastNode[entity.id]){
        var oldX = entitiesLastNode[entity.id].x;
        var oldY = entitiesLastNode[entity.id].y;  
        var node = entitiesMap[oldX][oldY];
 
        if(oldX !== newX || oldY !== newY){
            for(var i in node){
                if(node[i] === entity.id){
                  //  console.log('deleting some stuff')
                    node.splice(i, 1);
                    entitiesLastNode[entity.id] = {x: newX, y: newY};
                    entitiesMap[newX][newY].push(entity.id);


                }
            }
            return true; //moved
        }
        return false; //didn't move
    }
    else{
        entitiesLastNode[entity.id] = {x: newX, y: newY};
        entitiesMap[newX][newY].push(entity.id);
        return false;
    }

}


function drawHighlight(entity, canvas){

  var ctx = canvas.getContext('2d');
  ctx.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2,  canvas.height * 2/3, canvas.width / 2.5, canvas.width / 3, 0, 0, Math.PI*2);
  ctx.strokeStyle='red';
  ctx.stroke();
  ctx.restore();

}

function drawHealthBar(entity, canvas){
                      
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = entity.color;


  //ctx.fillRect(entity.x * zoom + backgroundOffset.x * zoom, entity.y * zoom - size * zoom/ 4 + backgroundOffset.y * zoom , size * zoom, size * zoom / 13);
  ctx.fillRect(0, 0, canvas.width, canvas.height / 15);
  ctx.fillStyle = "red"; //generalize this

  var health = 100 - entity.health; //Hacky fix for healthbar issue
      

  ctx.fillRect((1 - health / 100) * canvas.width, 0, (health / 100) * canvas.width, canvas.height / 15);

    }
function animateEntity(entity){
  /*console.log(entity.id);
  console.log(entity.attacking);*/
  if(!entity.walking && !entity.attacking && entity.type !== 'quarry'){  
      if(entity.walkingState !== 1){
	      entity.walkingState = 1;  
      }
  }
  else if(entity.dead){
    entity.walkingState = 2;

  }
  else if(entity.attacking){
    entity.walkingState === 0 ? entity.walkingState = 1 : entity.walkingState = 0;
  }
  else if (entity.walking || entity.type === 'quarry'){  
        entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
        
  }
	var victim = null;
	var current = null;
	if(entity.attacking){
		current = {};
		current.x = entity.x;
		current.y = entity.y
		victim = {};
		victim.x = entity.victim.x;
		victim.y = entity.victim.y;
	}else if(entity.walking){
		victim = {};
		victim.x = entity.nextNode.x * 32;
		victim.y = entity.nextNode.y * 32;
		current = {};
		current.x = entity.previousNode.x * 32;
		current.y = entity.previousNode.y * 32;
		
	}
  	setDirectionFacing(current, entity, victim);

}


function setDirectionFacing(current, entity, victim){



    if(victim){
      var angle = Math.atan2(victim.y - current.y, victim.x - current.x); //entity x, y is the origin
      angle = angle * 360 / (2 * 3.1415); 
      angle < 0 ? angle = 180 - angle : null;  
    //  console.log(angle);
  /*
          90e
   0e       victim         180e
          270 e
  */


      if(angle >= 45 && angle < 135){
        entity.directionPointing = 'S';
      }else if(angle >= 135 && angle < 225){
        entity.directionPointing = 'W';
      }else if(angle >= 225 && angle < 315){
        entity.directionPointing = 'N';
      }else if(angle >= 315 && angle < 45){
        entity.directionPointing = 'E';
      }
    }


  
  else if(entity.directionPointing !== 'S' && !entity.dead){
	
    entity.directionPointing = 'S';
  }


}
