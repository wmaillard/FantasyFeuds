//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
//Class to load the map
var scene = {
    zoom: 1,
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
            backgroundOffset.y = -levelHeight*size + $(window).height();
            if (levelWidth * size < window.innerWidth) {
                backgroundOffset.x = window.innerWidth - levelWidth * size
            }; //fixes window too wide bug
            blockingTerrain = new Array(layer.width);
            for (var i = 0; i < layer.width; i++) {
                blockingTerrain[i] = new Array(layer.height);
                blockingTerrain[i].fill(false);
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
            scene.loadTileset(scene.data);
        }

    }
}





//function to draw the entities
function drawEntities(entities, ctx, lock, clear) { //changed heroes position

    var scratchCanvas = ctx.canvas.cloneNode();
    scratchCanvas = scratchCanvas.getContext("2d");
    scratchCanvas.canvas.height = levelHeight * 32;
    scratchCanvas.canvas.width = levelHeight * 32;
    //scratchCanvas.clearRect(0, 0, scratchCanvas.canvas.width, scratchCanvas.canvas.height); //may not need

    for (var entity in entities) {

        var img_x = entities[entity].walkingState * entities[entity].size;
        var img_y = directions[entities[entity].directionPointing] * entities[entity].size;
        if (entities[entity].walking == true) {
            if (!lock) {
                entities[entity].walkingState === 0 ? entities[entity].walkingState = 2 : entities[entity].walkingState = 0;
            }
        } else {
            entities[entity].walking.state = 1;
        }

        var x, y;
        x = entities[entity].x;
        y = entities[entity].y;
        if (isBlocked(x, y) === 'wall' || isBlocked(x + 32, y) === 'wall' || isBlocked(x, y + 32) === 'wall' || isBlocked(x + 32, y + 32) === 'wall') {
            scratchCanvas.drawImage(entities[entity].blank, img_x, img_y, entities[entity].size, entities[entity].size, entities[entity].x, entities[entity].y, 32, 32);
        } else {
          
          if(entities[entity].current === true){  
            //void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
            scratchCanvas.save(); // This drawing if block was lifted from here: http://jsbin.com/ovuret/722/edit?html,js,output with our entities position added
            scratchCanvas.beginPath();
            scratchCanvas.ellipse(entities[entity].x + size / 2, entities[entity].y + size * 4/5, 15 * zoom, 10 * zoom, 0, 0, Math.PI*2);
            scratchCanvas.strokeStyle='red';
            scratchCanvas.stroke();
            scratchCanvas.restore();
      }

                      
          if(entities[entity].isHero === true){
         scratchCanvas.fillStyle = "green";
      }else{
        scratchCanvas.fillStyle = "yellow";
      }

          scratchCanvas.fillRect(entities[entity].x, entities[entity].y - size/ 4, size, size / 13);


          if(level === 'theNorth'){  //generalize this
            scratchCanvas.fillStyle = "green";
            scratchCanvas.fillRect(675, 2150, size*5, 2*size / 13);
            scratchCanvas.fillStyle = "yellow";
            scratchCanvas.fillRect(460, 100, size*5, 2*size / 13);
          }else if (level === 'theNeck'){
            scratchCanvas.fillStyle = "green";
            scratchCanvas.fillRect(200, 2150, size*5, 2*size / 13);
            scratchCanvas.fillStyle = "yellow";
            scratchCanvas.fillRect(600, 90, size*5, 2*size / 13);
          }else if (level === 'dorne'){
            scratchCanvas.fillStyle = "green";
            scratchCanvas.fillRect(650, 2150, size*5, 2*size / 13);
            scratchCanvas.fillStyle = "yellow";
            scratchCanvas.fillRect(500, 90, size*5, 2*size / 13);
          }
     scratchCanvas.fillStyle = "red"; //generalize this

            var health = 100 - entities[entity].health; //Hacky fix for healthbar issue
      var bnh = 1000 - baseNHealth;
      var bsh = 1000 - baseSHealth;
            if(level === 'theNorth'){
              scratchCanvas.fillRect(460 + (1 - bnh/ 1000) * size * 5, 100, bnh / 1000 * size*5, 2*size / 13);
              scratchCanvas.fillRect(675+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
            }else if(level === 'theNeck'){
              scratchCanvas.fillRect(600 + (1 - bnh/ 1000) * size * 5, 90, bnh / 1000 * size*5, 2*size / 13);
              scratchCanvas.fillRect(200+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
            }else if(level === 'dorne'){
              scratchCanvas.fillRect(500 + (1 - bnh/ 1000) * size * 5, 90, bnh / 1000 * size*5, 2*size / 13);
              scratchCanvas.fillRect(675+ (1 - bsh/ 1000) * size * 5, 2150, bsh / 1000 *size*5, 2*size / 13);
            }
          

            scratchCanvas.fillRect(entities[entity].x + (1 - health / 100) * size, entities[entity].y - size/ 4, (health / 100) * size, size / 13);
            scratchCanvas.drawImage(entities[entity].image, img_x, img_y, entities[entity].size, entities[entity].size, entities[entity].x, entities[entity].y, 32, 32);
        }

        if (!clear) {
            ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
        }

        ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())

    }
    

}
