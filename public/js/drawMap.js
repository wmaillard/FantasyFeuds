var newCan =  document.createElement('canvas');  //Still relevant? //This probably takes too long, keep one canvas active for this, store with character images.

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

        if (layer.name === 'Bottom' && firstLoad) {
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
            scene.context.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, canvasWidth / scene.zoom, canvasHeight / scene.zoom, 0, 0, canvasWidth, canvasHeight); //draw image from scratch canvas for better performance

        } else { //if all the layers have been previously loaded, use the cache

            scene.layers.forEach(function(layer) {
                backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
                backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
                (layer.width + backgroundOffset.x) / scene.zoom < canvasWidth ? backgroundOffset.x = canvasWidth * scene.zoom - layer.width : backgroundOffset.x;
                (layer.height + backgroundOffset.y) / scene.zoom < canvasHeight ? backgroundOffset.y = canvasHeight * scene.zoom - layer.height : backgroundOffset.y;
                //var i = $("<img />", {src: src})[0];
                // //console.log(layer);
                scene.context.drawSafeImage(layer, -backgroundOffset.x, -backgroundOffset.y, canvasWidth * scene.zoom, canvasHeight * scene.zoom, 0, 0, canvasWidth, canvasHeight); //draw image from scratch canvas for better performance
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


