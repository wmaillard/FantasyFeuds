var newCan =  document.createElement('canvas');  //Still relevant? //This probably takes too long, keep one canvas active for this, store with character images.
var rows = 20;
var columns = 20;

//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
//Class to load the map
var scene = {
    tileSets: [],
    context: "",
    layers: [],
    tiles: {},

    renderLayer: function(layer) {

        if (layer.type !== 'tilelayer' || !layer.opacity) {
            //console.log("Error Loading: Not a visible tile layer");
        }
       

        ////console.log(scratchCanvas.canvas.height);
        //   //console.log(scratchCanvas.canvas);

        if (firstLoad) {
            levelWidth = 1000;
            levelHeight = 1000;
            //backgroundOffset.y = -levelHeight*size + $(window).height();
         /*   if (levelWidth * size < window.innerWidth) {
                backgroundOffset.x = window.innerWidth - levelWidth * size
            }; //fixes window too wide bug*/
            /*blockingTerrain = new Array(layer.width);
            for (var i = 0; i < layer.width; i++) {
                blockingTerrain[i] = new Array(layer.height);
                blockingTerrain[i].fill(false);
            }*/
            entitiesMap = new Array(levelWidth);
            for (var i = 0; i < levelWidth; i++) {
                entitiesMap[i] = new Array(levelHeight);
                for(var j = 0; j < entitiesMap[i].length; j++){
                    entitiesMap[i][j] = [];
                }
            }
            
        }


        if (firstLoad) { //first fill up the array of scratch canvas's, then use later

			 scene.tiles[layer.name] = {};
			 scene.tiles[layer.name].url = [];
			 scene.tiles[layer.name].img = [];
			

			var size = scene.data.tilewidth;
	        for(var i = 0; i < rows * columns; i++){

			//var scratchCanvas = document.createElement("canvas");;
	        	//scratchCanvas = scratchCanvas.getContext("2d");
	        	//scratchCanvas.canvas.height = layer.height * size / rows;
	        	//scratchCanvas.canvas.width = layer.width * size / columns;
			var url = 'https://res.cloudinary.com/ochemaster/image/upload/c_scale,w_1.0/v1476547914/map/' + layer.name + i + '.png'

	        scene.tiles[layer.name].url[i] = url;
			

	        }

        
          /*  layer.data.forEach(function(tile_idx, i) { //draw each tile

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

     /*           img_x = (tile_idx % (tile.imagewidth / size)) * size; //pinpoint tile on x, y matrix tilesheet
                img_y = ~~(tile_idx / (tile.imagewidth / size)) * size; //Math.floor avoids floating point blurryness, can use fancy ~~ instead

                s_x = (i % layer.width) * size;
                s_y = (~~(i / layer.width) * size);*/

                //I beleive s_x, s_y is the upper left corner of a tile, so if it is in layer > 0 (check this), then
                //s_x to s_x - size and s_y to s_y - size should be added to terrain array

                /*if (layer.name !== 'Bottom' && layer.name !== 'Bridges' && firstLoad) {
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
                }*/


                //  if(s_x > $('#background').width() || s_y > $('#background').height()){return;} //outside current window, don't load
  /*              var coord = ~~(s_x / (layer.width * size / columns) ) + columns * (~~(s_y / (layer.height * size / rows)));
                //console.log('coord', coord)
                
                s_x %= (layer.width * size / columns);
                s_y %= (layer.height * size / rows);




                scene.layerCanvas[layer.name].canvas[coord].drawImage(scene.tileSets[tileSetIndex], img_x, img_y, size, size, s_x, s_y, size, size);
*/
            //});



        	drawFromArray(layer.name, rows, columns);

            //scene.layers.push(scratchCanvas.canvas.toDataURL()); //save scratch canvas for later
           // scene.layers.push(scratchCanvas.canvas);
            //scene.context.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, canvasWidth / scene.zoom, canvasHeight / scene.zoom, 0, 0, canvasWidth, canvasHeight); //draw image from scratch canvas for better performance

        } else { //if all the layers have been previously loaded, use the cache

            


             /*   backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
                backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
                (layer.width + backgroundOffset.x) / scene.zoom < canvasWidth ? backgroundOffset.x = canvasWidth * scene.zoom - layer.width : backgroundOffset.x;
                (layer.height + backgroundOffset.y) / scene.zoom < canvasHeight ? backgroundOffset.y = canvasHeight * scene.zoom - layer.height : backgroundOffset.y;
                */ 
                //var i = $("<img />", {src: src})[0];
                // //console.log(layer);
				drawFromArray(layer.name, rows, columns);   
	         
        
    }
},

    renderLayers: function(layers) {
        /*layers = $.isArray(layers) ? layers : scene.data.layers; //can pass an array of layers
        layers.forEach(scene.renderLayer);*/
        scene.renderLayer({name: 'tile'})
        firstLoad = false;
    },

    loadTileset: function(json) {
        /*this.data = json;

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
        });*/
        scene.renderLayers(this);

    },

    load: function(name, ctx, zoom) {
        if (clearBackground) {
            clearBackground = false;
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        scene.zoom = 1 / zoom;
        scene.context = ctx;

        if (firstLoad) {

        	
                    //this.data = json;
                    scene.data = {layers: {name: 'tile'}};
                    scene.loadTileset(scene.data);
 
        } else {
            scene.renderLayers(false);
        }

    }
}
function zoomURL(url, scale){
	//scale must be string '1.0', '0.5', etc
	var parts = url.split("/");
	var newURL = "";
	for(var i in parts){ 
		if(i == 6){
			newURL += ("c_scale,w_" + scale);
		}
		else{
			newURL += parts[i];
		}
		if(i != parts.length - 1){
			newURL += '/';
		}
	}
	return newURL

}
function clearURLImages(tiles){
	for(var i in tiles.url){
		if(tiles.img[i]){
			tiles.img[i] = null;
		}
		tiles.url[i] = zoomURL(tiles.url[i], '0.25');
	}

}
var currentZoomResolution = '1.0';
function drawFromArray(layerName, rows, columns){


	var saveZoom = zoom;
	if(zoom < 0.25 && currentZoomResolution !== '0.25'){
		clearURLImages(scene.tiles['tile']);
		currentZoomResolution = '0.25';
	}
	/*if(zoom < 0.25){
		zoom += 1;
	}*/

	var upperLeft = {}
	upperLeft.x = Math.abs(backgroundOffset.x) ;
	upperLeft.y = Math.abs(backgroundOffset.y) ;

	var doneInX = false;
	var doneInY = false;
	var firstX = true;
	var firstY = true;
	var last = false;

	var dest = {};
	var colWidth = ~~(levelWidth * size / columns);
	var rowHeight = ~~(levelHeight * size / rows);
	dest.x = 0;
	dest.y = 0;
	var yDrawn = 0;
	var xDrawn = 0;

	var tilesUsed = {};
	var widthInTiles = Math.ceil(($('#gameContainer').width() / zoom) / colWidth);
	var heightInTiles = Math.ceil(($('#gameContainer').height() / zoom) / rowHeight);

	for(var i = 0; i <  scene.tiles[layerName].url.length; i++){
		//if, based on the offset and the amount being drawn, we should use this canvas.  Draw a piece using that canvas
		if(doneInY && doneInX){
			//console.log('************ double done ************')
			break;
		}

		var option1 = ~~(upperLeft.x / colWidth) + columns * (~~(upperLeft.y / rowHeight)) === i; // in the box


		if(option1){ //if our upper left x comes from the layer, use it
			tilesUsed[i] = true;
			//TODO track who gets in here and then iterate through scene.layers and remove those that don't belong

			/*var s_w, s_h;
			var smallUpperLeft = {};
			smallUpperLeft.x = upperLeft.x % colWidth; //The x and y in the canvas cutout
			smallUpperLeft.y = upperLeft.y % rowHeight;*/

		/*	if(canvasWidth / zoom > scene.layerCanvas[layerName][i].canvas.width - smallUpperLeft.x){
				s_w = scene.layerCanvas[layerName][i].canvas.width - smallUpperLeft.x;
				upperLeft.x += s_w;  
				
			}else{
				//console.log('here*********************');
				s_w = colWidth;
				doneInX = true;
			}
			if(canvasHeight / zoom > scene.layerCanvas[layerName][i].canvas.height - smallUpperLeft.y){
				s_h = scene.layerCanvas[layerName][i].canvas.height - smallUpperLeft.y;
				
				
			}else{
				//console.log('here2***********************');
				s_h = rowHeight;
				doneInY = true;
				
				
			}*/
			/*console.log('Drawing')
			console.log('Canvas Number: ', i)
			console.log(layerName);
	
			console.log('upperLeft', upperLeft.x, upperLeft.y);
			console.log('s_w, s_h: ', s_w, s_h);
			console.log('Dest', dest);
			
			console.log('BackgroundOffset: ', backgroundOffset);*/
			var offset = {x : 0, y : 0};

			if(firstX){
				offset.x = (Math.abs(backgroundOffset.x)) % colWidth;  //Start cutting the 1st column of canvas's at offset.x
				
			}
			if(firstY){
				offset.y = (Math.abs(backgroundOffset.y)) % rowHeight; //Start cutting the top row of canvas's at offset.y
			}
			var eight = loadEightAround(i, rows, columns);
			for(var j in eight){
				if(!tilesUsed[eight[j]]){
				    tilesUsed[eight[j]] = true;
				}
				
				

			}
			//console.log('offset', offset)
			if(!scene.tiles[layerName].img[i]){

			
			for(var j in eight){
				
				if(!scene.tiles[layerName].img[eight[j]]){
						var img = new Image;
						img.src = scene.tiles[layerName].url[eight[j]];
						scene.tiles[layerName].img[eight[j]] = img; 
				}
				

			}
				var img = new Image;
				img.onload = function(){
					scene.context.drawImage(img, offset.x , offset.y, colWidth - offset.x, rowHeight - offset.y, xDrawn, yDrawn, (colWidth - offset.x) * zoom, (rowHeight - offset.y) * zoom); //draw image from scratch canvas for better performance
				};
				img.src = scene.tiles[layerName].url[i];
				scene.tiles[layerName].img[i] = img;
			}else{
				var img = scene.tiles[layerName].img[i];
				if(!img.complete){  //If the image was created but isn't loaded, override the onload function
					img.onload = function(){
						scene.context.drawImage(img, offset.x , offset.y, colWidth - offset.x, rowHeight - offset.y, xDrawn, yDrawn, (colWidth - offset.x) * zoom, (rowHeight - offset.y) * zoom); //draw image from scratch canvas for better performance
					}
				
				}else{
					scene.context.drawImage(img, offset.x , offset.y, colWidth - offset.x, rowHeight - offset.y, xDrawn, yDrawn, (colWidth - offset.x) * zoom, (rowHeight - offset.y) * zoom); //draw image from scratch canvas for better performance
				}
			}

			
			xDrawn += (colWidth - offset.x) * zoom;

			//console.log('xDrawn', xDrawn)

			if(xDrawn > canvasWidth){
				xDrawn = 0;
				upperLeft.x = Math.abs(backgroundOffset.x) ;
				doneInX = true;
			}


			if(doneInX){
				
				yDrawn += (rowHeight - offset.y) * zoom;

				//upperLeft.x = Math.abs(backgroundOffset.x);
				
				//console.log('ydrawn', yDrawn)
				if(yDrawn < canvasHeight){
					upperLeft.y += rowHeight;
					doneInX = false;
					
				}else{
					doneInY = true;
				}
				
				
				
				firstX = true;
				firstY = false;
			}else{
				firstX = false;
				upperLeft.x += colWidth;
			}

			

			
		}

		//scene.context.drawSafeImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, canvasWidth / scene.zoom, canvasHeight / scene.zoom, 0, 0, canvasWidth, canvasHeight); //draw image from scratch canvas for better performance
	}
	//console.log(tilesUsed);
	cleanUp(tilesUsed, scene.tiles[layerName].img, widthInTiles, heightInTiles);
	
	zoom = saveZoom;
}

function loadEightAround(current, rows, columns){
	var eight = [];


	if(current - columns >= 0){
		eight.push(current - columns);
	}
	if(current + columns < columns * rows){
		eight.push(current + columns);
	}

	if(current % columns !== columns - 1){
		eight.push(current + 1);
		if(current - columns + 1 >= 0){
			eight.push(current - columns + 1);
		}
		if(current + columns + 1 < columns * rows){
			eight.push(current + columns + 1);
		}

	}

	if(current % columns !== 0){
		eight.push(current - 1)
		if(current - columns - 1 >= 0){
			eight.push(current - columns -1);
		}
		if(current + columns - 1 < columns * rows){
			eight.push(current + columns - 1);
		}
	}

	
	return eight;


}
function cleanUp(tilesUsed, layerImgs, widthInTiles, heightInTiles){  //TODO use this to preload images too
	//console.log('Width', widthInTiles);
	//console.log('Height ', heightInTiles);
	//var numToAdd = Math.ceil(Math.min(widthInTiles, heightInTiles) / 2);  

	for(var i in layerImgs){
		if(!tilesUsed[i]){
			layerImgs[i] = null;
		}
	}
}
