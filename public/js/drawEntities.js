


function drawEntities(entities, ctx, lock, clear) { 
    //Lets just do this if there was a change, or does it matter.  There probably will always be a change...

  ctx.clearRect(0, 0, $("#background").width(), $("#background").height());

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
    var animate = false;
    if(Date.now() > lastAnimation + 250 || serverSentFullState){
        lastAnimation = Date.now();
        serverSentFullState = false;
        animate = true;
    }
    for (var entity in entities) {
        
      if(animate){
        animateEntity(entities[entity]);
      }
        
        var img_x = entities[entity].walkingState * entities[entity].size;
        var img_y = directions[entities[entity].directionPointing] * entities[entity].size;
        //animateEntity(entities[entity]);


        var x, y, nodeX, nodeY;
        x = entities[entity].x;
        y = entities[entity].y;
        nodeX = ~~(x / size);
        nodeY = ~~(y / size);
        
        entities[entity].moved = setNodeXY(entities[entity], entitiesMap,  entitiesLastNode);  //need to store last node and need to run this every time we get new entities with if(lastNode !== currentNode)
        


        //need to make isBlocked safe
        if (false && (isBlocked(x, y) === 'wall' || isBlocked(x + 32, y) === 'wall' || isBlocked(x, y + 32) === 'wall' || isBlocked(x + 32, y + 32) === 'wall')) {
            cutOutCharacter(newCan, characterImages.blank, img_x, img_y, entities[entity].width, entities[entity].height, entities[entity]);

        } else {
			var whichImage = entities[entity].type;
			if(entities[entity].dead || (entities[entity].attacking && entities[entity].walkingState !== 2)){
				whichImage += 'Pose';
			}
          
      cutOutCharacter(newCan, characterImages[whichImage], img_x, img_y, entities[entity].size, entities[entity].size, entities[entity]);
			if(!entities[entity].dead){  
				drawHealthBar(entities[entity], newCan);
			}

        // scaleDown(newCan, 32, 32);
          ctx.drawSafeImage(newCan, 0, 0, newCan.width, newCan.height,  x * zoom + backgroundOffset.x * zoom - size * zoom, y * zoom + backgroundOffset.y * zoom - size * zoom, newCan.width * entitySize * zoom, newCan.height * entitySize * zoom);
         //ctx.drawImage(newCan, 300, 200);
        //  ctx.drawImage(newCan, 0, 0, 32, 32,  x - backgroundOffset.x, y - backgroundOffset.y, 32, 32);  //This is going from 150 to 32

        }



  /*        if (!clear) {
             ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
          }*/



              //Here you are upscaling everything in scratchCanvas so it probably looks shitty. Draw the scratch canvas at the correct zoom and then draw it on ctx dumbass, heh heh heh
            // This was the original one: ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, -16 * zoom,  -16 * zoom, $('#background').width(), $('#background').height())

            //ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())

    }
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
  ctx.ellipse(canvas.width / 2,  canvas.height * 2/3, canvas.width / 3, canvas.width / 2.5, 0, 0, Math.PI*2);
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

  if(entity.dead){
    entity.walkingState = 2;

  }
  else if(entity.attacking){
    entity.walkingState === 0 ? entity.walkingState = 1 : entity.walkingState = 0;
  }
  else if (entity.walking || entity.type === 'quarry'){  
        entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
        
  }
  else if(!entity.walking && !entity.attacking && entity.type !== 'quarry'){  
      entity.walkingState = 1;  
  }

  setDirectionFacing(entity);

}


function setDirectionFacing(entity){
  if(entity.attacking){

    var victim = entities[entity.victim];
    if(victim){
      var angle = Math.atan2(victim.y - entity.y, victim.x - entity.x); //entity x, y is the origin
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
        entity.diretionPointing = 'E';
      }
    }


  }





  else if(entity.walking && entity.path.length > 0){















    var currentNode = {x: ~~(entity.x / 32), y: ~~(entity.y / 32)};
    var nextNode = entity.nextNode;
    if(nextNode && nextNode.x !== currentNode.x || nextNode && nextNode.y !== currentNode.y){
      if(currentNode.x === nextNode.x){
        if(currentNode.y < nextNode.y){
          entity.directionPointing = 'S';
        }else{
          entity.directionPointing = 'N'
        }
      }else{
        if(currentNode.x < nextNode.x){
          entity.directionPointing = 'E'
        }else{
          entity.directionPointing = 'W';
        }
      }
    }
  }
  else if(!entity.dead){

    entity.directionPointing = 'S';
  }




/* Keep this for a more fluid testing
  if(nextNode && nextNode.x !== currentNode.x && nextNode.y !== currentNode.y){

    var bPos = currentNode.y - currentNode.x;
    var bNeg = currentNode.y + currentNode.x;
    var yOnPos = nextNode.x + bPos;
    var yOnNeg = -nextNode.x + bNeg;
    if(nextNode.x < currentNode.x){
      if(nextNode.y < yOnPos && nextNode.y > yOnNeg){
        entity.directionPointing = 'W';
      }
      else if(nextNode.y < yOnNeg){
        entity.directionPointing = 'N';
      }
      else{
        entity.directionPointing = 'S'
      }
    }else{
      if(nextNode.y > yOnPos && nextNode.y < yOnNeg){
        entity.directionPointing = 'E';
      }     
      else if(nextNode.y < yOnPos){
        entity.directionPointing = 'N';
      }
      else{
        entity.directionPointing = 'S'
      }
    }
  }*/
}
