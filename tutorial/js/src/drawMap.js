var scene = {
    tileSets: [],
    context: "",
    layers: [],
    tiles: {},
    renderLayer: function(layer) {
        if (firstLoad) { //first fill up the array of scratch canvas's, then use later
            scene.tiles[layer.name] = {};
            scene.tiles[layer.name].url = [];
            scene.tiles[layer.name].img = [];
            var size = scene.data.tilewidth;
            for (var i = 0; i < rows * columns; i++) {
                var url = 'img/tutorialMap.png';
                if(limitRAM){
                    scene.tiles[layer.name].url[i] = url;
                }
                if(!limitRAM){
                    scene.tiles[layer.name].img[i] = new Image();
                    scene.tiles[layer.name].img[i].src = url;
                
                }
            }
            drawFromArray(layer.name, rows, columns);
        } else { //if all the layers have been previously loaded, use the cache
            drawFromArray(layer.name, rows, columns);
        }
    },
    load: function(name, ctx, zoom) {
        scene.zoom = 1 / zoom;
        scene.context = ctx;
        if (firstLoad) {
            scene.data = { layers: { name: 'tile' } };
            scene.renderLayer({ name: 'tile' })
            firstLoad = false;
        } else {
            scene.renderLayer({ name: 'tile' })
        }
    }
}

function zoomURL(url, scale) {

    //scale is 5, 10, 25, 50, 100
    var parts = url.split("/");
    var newURL = "";
    for (var i in parts) {
        if (i == 4) {
            newURL += scale;
        } else if (i != parts.length - 1) {
            newURL += parts[i];
        }
        if (i != parts.length - 1) {
            newURL += '/';
        } else {
            var splitName = parts[i].split("_");
            newURL += (splitName[0] + '_' + scale + '.png');
        }
    }
    return newURL
}

function clearURLImages (tiles, currentZoomR) {
    for (var i in tiles.url) {
        if (tiles.img[i]) {
            tiles.img[i] = null;
        }
        tiles.url[i] = zoomURL(tiles.url[i], currentZoomR);
    }
}

function drawFromArray(layerName, rows, columns) {
    var saveZoom = zoom;
    //Step down or up image resolutions
    //BUG switched 25 off
    currentZoomResolution = 1;
    if (zoom > 0.25 && currentZoomResolution !== 1) {
        if(limitRAM){
            clearURLImages(scene.tiles['tile'], '100');
        }
        currentZoomResolution = 1;
    }/* else if (!safari && zoom <= 0.25 && currentZoomResolution !== 0.25) {
        clearURLImages(scene.tiles['tile'], '25');
        currentZoomResolution = 0.25;
    }*/
    var upperLeft = {}
    upperLeft.x = Math.abs(backgroundOffset.x);
    upperLeft.y = Math.abs(backgroundOffset.y);
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
    var toLoadAfter = []; 
    for (var i = 0; i < rows * columns; i++) {
        //if, based on the offset and the amount being drawn, we should use this canvas.  Draw a piece using that canvas
        if (doneInY && doneInX) {
            break;
        }
        // in the box
        if (~~(upperLeft.x / colWidth) + columns * (~~(upperLeft.y / rowHeight)) === i) { //if our upper left x comes from the layer, use it
            tilesUsed[i] = true;
            var offset = { x: 0, y: 0 };
            if (firstX) {
                offset.x = (Math.abs(backgroundOffset.x)) % colWidth; //Start cutting the 1st column of canvas's at offset.x
            }
            if (firstY) {
                offset.y = (Math.abs(backgroundOffset.y)) % rowHeight; //Start cutting the top row of canvas's at offset.y
            }
            var eight;
            if(limitRAM){
                eight = loadEightAround(i, rows, columns);
            }
            for (var j in eight) {
                if (!tilesUsed[eight[j]]) {
                    tilesUsed[eight[j]] = true;
                }
            }
            if (!scene.tiles[layerName].img[i] && limitRAM) {
                
                var img = new Image();
                img.onload = function(){
                    redrawBackground();
                }
                img.src = scene.tiles[layerName].url[i];
                scene.tiles[layerName].img[i] = img;
                toLoadAfter.push(eight);
                
            } else {
                var img = scene.tiles[layerName].img[i];
                if(img.complete){
                    scene.context.drawImage(img, offset.x * currentZoomResolution, offset.y * currentZoomResolution, colWidth - offset.x, rowHeight - offset.y, xDrawn, yDrawn, ((colWidth - offset.x) * zoom) / currentZoomResolution, (rowHeight - offset.y) * zoom / currentZoomResolution); //draw image from scratch canvas for better performance
                }
            }
            xDrawn += (colWidth - offset.x) * zoom;
            if (xDrawn > canvasWidth) {
                xDrawn = 0;
                upperLeft.x = Math.abs(backgroundOffset.x);
                doneInX = true;
            }
            if (doneInX) {
                yDrawn += (rowHeight - offset.y) * zoom;
                if (yDrawn < canvasHeight) {
                    upperLeft.y += rowHeight;
                    doneInX = false;
                } else {
                    doneInY = true;
                }
                firstX = true;
                firstY = false;
            } else {
                firstX = false;
                upperLeft.x += colWidth;
            }
        }
        //scene.context.drawSafeImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, canvasWidth / scene.zoom, canvasHeight / scene.zoom, 0, 0, canvasWidth, canvasHeight); //draw image from scratch canvas for better performance
    }
    var i;
    if(limitRAM){
    while(i = toLoadAfter.pop()){
        for (var j in toLoadAfter[i]) {
                    if (!scene.tiles[layerName].img[toLoadAfter[i][j]]) {
                        var img = new Image();
                        img.onload = function(){
                            redrawBackground();
                        }
                        img.src = scene.tiles[layerName].url[toLoadAfter[i][j]];
                        scene.tiles[layerName].img[toLoadAfter[i][j]] = img;
                    }
                }

    }
    }
    
    //console.log(tilesUsed);
    if(limitRAM){
        cleanUp(tilesUsed, scene.tiles[layerName].img, widthInTiles, heightInTiles);
    }
    zoom = saveZoom;
}

function loadEightAround (current, rows, columns) {
    var eight = [];
    if (current - columns >= 0) {
        eight.push(current - columns);
    }
    if (current + columns < columns * rows) {
        eight.push(current + columns);
    }
    if (current % columns !== columns - 1) {
        eight.push(current + 1);
        if (current - columns + 1 >= 0) {
            eight.push(current - columns + 1);
        }
        if (current + columns + 1 < columns * rows) {
            eight.push(current + columns + 1);
        }
    }
    if (current % columns !== 0) {
        eight.push(current - 1)
        if (current - columns - 1 >= 0) {
            eight.push(current - columns - 1);
        }
        if (current + columns - 1 < columns * rows) {
            eight.push(current + columns - 1);
        }
    }
    return eight;
}

function cleanUp(tilesUsed, layerImgs, widthInTiles, heightInTiles) { //TODO use this to preload images too
    for (var i in layerImgs) {
        if (!tilesUsed[i]) {
            layerImgs[i] = null;
        }
    }
}
