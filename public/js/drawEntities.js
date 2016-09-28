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
    

    for (var entity in entities) {
        

        setDirectionFacing(entities[entity]);
        
        var img_x = entities[entity].walkingState * entities[entity].size;
        var img_y = directions[entities[entity].directionPointing] * entities[entity].size;
        animateEntity(entities[entity]);


        var x, y, nodeX, nodeY;
        x = entities[entity].x;
        y = entities[entity].y;
        nodeX = ~~(x / size);
        nodeY = ~~(y / size);
        
        setNodeXY(entities[entity], entitiesMap,  entitiesLastNode);
        attackableEntities(entities[entity], entitiesMap);

        drawHealthBar(entities[entity], ctx);
        if (isBlocked(x, y) === 'wall' || isBlocked(x + 32, y) === 'wall' || isBlocked(x, y + 32) === 'wall' || isBlocked(x + 32, y + 32) === 'wall') {
            cutOutCharacter(newCan, 'blank', img_x, img_y, entities[entity].size, entities[entity].size);

        } else {
          cutOutCharacter(newCan, characterImages[entities[entity].type], img_x, img_y, entities[entity].size, entities[entity].size);

          if(entities[entity].selected === true){  
                //void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
                drawHighlight(entities[entity], ctx);
          }
          
          cutOutCharacter(newCan, characterImages[entities[entity].type], img_x, img_y, entities[entity].size, entities[entity].size);

        // scaleDown(newCan, 32, 32);
          ctx.drawSafeImage(newCan, 0, 0, 70, 70,  x * zoom + backgroundOffset.x * zoom, y * zoom + backgroundOffset.y * zoom, 32 * zoom, 32 * zoom);
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

function cutOutCharacter(newCan, img, x, y, width, height){
	newCan.width = width;
	newCan.height = height;
	var ctx = newCan.getContext('2d');
	ctx.drawSafeImage(img, x, y, width, height, 0, 0, width, height);
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
                if(node[i].id === entity.id){
                    console.log('deleting some stuff')
                    node.splice(i, 1);
                    entitiesLastNode[entity.id] = {x: newX, y: newY};
                    entitiesMap[newX][newY].push(entity);


                }
            }
        }
    }
    else{
        entitiesLastNode[entity.id] = {x: newX, y: newY};
        entitiesMap[newX][newY].push(entity);
    }

}
function animateEntity(entity){
    if (entity.walking === true){  
          entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
      }
   else {
      entity.walkingState = 1;  
  }
}

function drawHighlight(entity, ctx){
  ctx.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
  ctx.beginPath();
  ctx.ellipse(entity.x * zoom + size * zoom / 2 + backgroundOffset.x * zoom, entity.y * zoom + size * zoom * 4/5 + backgroundOffset.y * zoom, 15 * zoom, 10 * zoom, 0, 0, Math.PI*2);
  ctx.strokeStyle='red';
  ctx.stroke();
  ctx.restore();

}

function drawHealthBar(entity, ctx){
                      

     ctx.fillStyle = entity.color;


      ctx.fillRect(entity.x * zoom + backgroundOffset.x * zoom, entity.y * zoom - size * zoom/ 4 + backgroundOffset.y * zoom, size * zoom, size * zoom / 13);


      if(level === 'theNorth'){  //generalize this
        ctx.fillStyle = "green";
        ctx.fillRect(675, 2150, size*5, 2*size / 13);
        ctx.fillStyle = playerColor;
        ctx.fillRect(460, 100, size*5, 2*size / 13);
      }else if (level === 'theNeck'){
        ctx.fillStyle = "green";
        ctx.fillRect(200, 2150, size*5, 2*size / 13);
        ctx.fillStyle = "yellow";
        ctx.fillRect(600, 90, size*5, 2*size / 13);
      }else if (level === 'dorne'){
        ctx.fillStyle = "green";
        ctx.fillRect(650, 2150, size*5, 2*size / 13);
        ctx.fillStyle = "yellow";
        ctx.fillRect(500, 90, size*5, 2*size / 13);
      }
  ctx.fillStyle = "red"; //generalize this

  var health = 100 - entity.health; //Hacky fix for healthbar issue
  var bnh = 1000 - baseNHealth;
  var bsh = 1000 - baseSHealth;
        if(level === 'theNorth'){
          ctx.fillRect(460 + (1 - bnh/ 1000) * size * 5, 100, bnh / 1000 * size*5, 2*size / 13);
          ctx.fillRect(675+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
        }else if(level === 'theNeck'){
          ctx.fillRect(600 + (1 - bnh/ 1000) * size * 5, 90, bnh / 1000 * size*5, 2*size / 13);
          ctx.fillRect(200+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
        }else if(level === 'dorne'){
          ctx.fillRect(500 + (1 - bnh/ 1000) * size * 5, 90, bnh / 1000 * size*5, 2*size / 13);
          ctx.fillRect(675+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
        }
      

        ctx.fillRect(entity.x * zoom + (1 - health / 100) * size * zoom + backgroundOffset.x * zoom, entity.y * zoom - size * zoom/ 4 + backgroundOffset.y * zoom, (health / 100) * size * zoom, size * zoom / 13);

    }
//Move this to the client
function setDirectionFacing(entity){
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
