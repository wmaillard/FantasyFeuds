var newCan =  document.createElement('canvas');  //This probably takes too long, keep one canvas active for this, store with character images.

//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
//Class to load the map
var scene = {
    tileSets: [],
    context: "",
    layers: [],

    renderLayer: function(layer) {

        if (layer.type !== 'tilelayer' || !layer.opacity) {
            //console.log("Error Loading: Not a visible tile layer");
        }
        var scratchCanvas = scene.context.canvas.cloneNode();
        var size = scene.data.tilewidth;
        scratchCanvas = scratchCanvas.getContext("2d");
        ////console.log(scratchCanvas.canvas);
        scratchCanvas.canvas.height = layer.height * size;
        scratchCanvas.canvas.width = layer.width * size;
        ////console.log(scratchCanvas.canvas.height);
        //   //console.log(scratchCanvas.canvas);

        if (layer.name === 'BaseS' && firstLoad) {
            levelWidth = layer.width;
            levelHeight = layer.height;
            //backgroundOffset.y = -levelHeight*size + $(window).height();
            if (levelWidth * size < window.innerWidth) {
                backgroundOffset.x = window.innerWidth - levelWidth * size
            }; //fixes window too wide bug
            blockingTerrain = new Array(layer.width);
            for (var i = 0; i < layer.width; i++) {
                blockingTerrain[i] = new Array(layer.height);
                blockingTerrain[i].fill(false);
            }
            entitiesMap = new Array(layer.width);
            for (var i = 0; i < layer.width; i++) {
                entitiesMap[i] = new Array(layer.height);
                for(var j = 0; j < entitiesMap[i].length; j++){
                    entitiesMap[i][j] = new Array(0);
                }
            }
            
        }

        if (firstLoad) { //first fill up the array of scratch canvas's, then use later

            layer.data.forEach(function(tile_idx, i) {

                if (tile_idx === 0) {
                    return;
                } //tile_idx is the id of the specific tile given by Tiled

                var img_x, img_y, s_x, s_y; //nice description of these variables: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage

                var tile = -1;
                var tileSetIndex = 0;
                for (tileSetIndex; tileSetIndex < scene.data.tilesets.length - 1; tileSetIndex++) {
                    if (tile_idx >= scene.data.tilesets[tileSetIndex].firstgid && tile_idx < scene.data.tilesets[tileSetIndex + 1].firstgid) {
                        tile = scene.data.tilesets[tileSetIndex];
                        break;
                    }
                }
                if (tile === -1) {
                    tile = scene.data.tilesets[tileSetIndex];
                }
                tile_idx = tile_idx - tile.firstgid;

                img_x = (tile_idx % (tile.imagewidth / size)) * size; //pinpoint tile on x, y matrix tilesheet
                img_y = ~~(tile_idx / (tile.imagewidth / size)) * size; //Math.floor avoids floating point blurryness, can use fancy ~~ instead

                s_x = (i % layer.width) * size;
                s_y = (~~(i / layer.width) * size);

                //I beleive s_x, s_y is the upper left corner of a tile, so if it is in layer > 0 (check this), then
                //s_x to s_x - size and s_y to s_y - size should be added to terrain array

                if (layer.name !== 'Bottom' && layer.name !== 'Bridges' && firstLoad) {
                    if (layer.name === 'Top') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'wall';
                    } else if (false && layer.name === 'BaseS') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'BaseS';
                    } else if (false  && layer.name === 'BaseN') {
                        blockingTerrain[(i % layer.width)][~~(i / layer.width)] = 'BaseN';
                    } else {
                        if (blockingTerrain[(i % layer.width)][~~(i / layer.width)] === false) {
                            blockingTerrain[(i % layer.width)][~~(i / layer.width)] = true;
                        }
                    }
                }

                //  if(s_x > $('#background').width() || s_y > $('#background').height()){return;} //outside current window, don't load

                scratchCanvas.drawImage(scene.tileSets[tileSetIndex], img_x, img_y, size, size, s_x, s_y, size, size);

            });

            //scene.layers.push(scratchCanvas.canvas.toDataURL()); //save scratch canvas for later
            scene.layers.push(scratchCanvas.canvas);
            scene.context.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / scene.zoom, $('#background').height() / scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance

        } else { //if all the layers have been previously loaded, use the cache

            scene.layers.forEach(function(layer) {
                backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
                backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
                (layer.width + backgroundOffset.x) / scene.zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() * scene.zoom - layer.width : backgroundOffset.x;
                (layer.height + backgroundOffset.y) / scene.zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() * scene.zoom - layer.height : backgroundOffset.y;
                //var i = $("<img />", {src: src})[0];
                // //console.log(layer);
                scene.context.drawImage(layer, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() * scene.zoom, $('#background').height() * scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance
            });
        }
    },

    renderLayers: function(layers) {
        layers = $.isArray(layers) ? layers : scene.data.layers; //can pass an array of layers
        layers.forEach(scene.renderLayer);
        firstLoad = false;
    },

    loadTileset: function(json) {
        this.data = json;

        var itemsProcessed = 0;
        json.tilesets.forEach(function(item, index) { //does this give the images enough time to load?
            scene.tileSets[index] = new Image();
            if (useMin) {
                var imageAddr = item.image;
                imageAddr = imageAddr.slice(0, -4); //Only if all images are .png, which they are...
                imageAddr += '-min.png';
                scene.tileSets[index].src = imageAddr;
            } else {
                scene.tileSets[index].src = item.image;
            }

            (scene.tileSets[index]).onload = function() {
                itemsProcessed++;
                if (itemsProcessed === json.tilesets.length) {
                    scene.renderLayers(this);
                }
            };
        });

    },

    load: function(name, ctx, zoom) {
        if (clearBackground) {
            clearBackground = false;
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        scene.zoom = 1 / zoom;
        scene.context = ctx;

        if (firstLoad) {
            $.getJSON("js/maps/" + name + ".json", function(json) {
                    //this.data = json;
                    scene.data = json;
                    scene.loadTileset(scene.data);
                }) //.fail(alert("aweful things have happend"));
        } else {
            scene.renderLayers(false);
        }

    }
}


function drawEntities(entities, ctx, lock, clear) { 
    //Lets just do this if there was a change, or does it matter.  There probably will always be a change...

  ctx.clearRect(0, 0, $("#background").width(), $("#background").height());

      var directions = {
        'S': 0,
        'W': 1,
        'E': 2,
        'N': 3
    }

 var scratchCanvas = ctx.canvas.cloneNode();    
 scratchCanvas = scratchCanvas.getContext("2d");
    scratchCanvas.canvas.height = levelHeight * 32;  //Right now we are drawing the entire level worth of entities, then cutting a piece of that, super wasteful
    scratchCanvas.canvas.width = levelWidth * 32 ;
    
    var backgroundWidth = $('#background').width();
    var backgroundHeight = $('#background').height();

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
          ctx.drawImage(newCan, 0, 0, 150, 150,  x * zoom + backgroundOffset.x * zoom, y * zoom + backgroundOffset.y * zoom, 32 * zoom, 32 * zoom);
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
	ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
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
		ctx.drawImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, oldWidth/2, oldHeight/2);
	}
	justCharacter.height = height;
	justCharacter.width = width;
	var finalCtx = justCharacter.getContext('2d');
	finalCtx.clearRect(0, 0, justCharacter.width, justCharacter.height);
	finalCtx.drawImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
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
      entity.walking.state = 1;  
  }
}

function drawHighlight(entity, ctx){
  ctx.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
  ctx.beginPath();
  ctx.ellipse(entity.x + size / 2, entity.y + size * 4/5, 15 * zoom, 10 * zoom, 0, 0, Math.PI*2);
  ctx.strokeStyle='red';
  ctx.stroke();
  ctx.restore();
}

function drawHealthBar(entity, ctx){
                      

     ctx.fillStyle = entity.color;


      ctx.fillRect(entity.x, entity.y - size/ 4, size, size / 13);


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
      

        ctx.fillRect(entity.x + (1 - health / 100) * size, entity.y - size/ 4, (health / 100) * size, size / 13);

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
