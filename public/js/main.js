//GLOBALS
var APIURL = "https://got-rts.appspot.com"; //"http://httpbin.org/post" // 
var useMin = true; //use minimized images
var fps = 5; //This is just for panning
var level;
var backgroundChange = true;
var panning = false;
var fullOnPanning = false;
var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Offset of map
var panInterval;
var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning
var zoom = 1;
var clearBackground = false;
//[x][y] if(p[x][y] == true){alert(something there)}
var blockingTerrain = [];

var firstLoad = true;
var entities = []; //changed from {} to allow push
var entitySpeed = fps * 2 / 5; // Walking speed of entities
var directions = {
    'S': 0,
    'W': 1,
    'E': 2,
    'N': 3
}
var levelWidth;
var levelHeight;
var zoomHappened = false;
var size = 32; //Tile size is 32 x 32

var pause = false;
var click = false;
var levels = ['theNeck', 'theNorth', 'dorne'];
var levelTitles = {
    theNeck: 'The Neck',
    theNorth: 'The North',
    dorne: 'Dorne'
}
var levelsWon = ['theNeck'];

var quarter = 0;

var player1 = {};
var player2 = {};

var baseSHealth = 1000;
var baseNHealth = 1000;
var baseN = [];
var baseS = [];
var smallNX = 0;
var bigNX = 0;
var smallNY = 0;
var bigNY = 0;

var smallSX = 0;
var bigSX = 0;
var smallSY = 0;
var bigSY = 0;
var intervalSetMap = false;
var intervalSetCharacters = false;

function metaStartGame(overRide){
	if(!overRide && Cookies.get('loggedIn') === "true"){
		loadGame();
	}
	else{
		entities = [];
        baseSHealth = 1000;
        baseNHealth = 1000;
		firstLoad = true;
		startLevel();

	} 
}

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


      		if(level === 'theNorth'){
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
	   scratchCanvas.fillStyle = "red";

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

function setUpEverything(){
	$('#signOut').click(function() {
		$('#saveGame').hide();
	    logOut();
	    return false;
	});

	$('#signInNav').click(function() {
	    signInNav();
	    return false;
	})

	$("#zoomIn").click(function() {
	    zoomIn();
	    return false;
	});

	$("#zoomOut").click(function() {
	    zoomOut();
	    return false;
	});

    $('#menu-close').click(function(){
    	$('#menu-toggle').show()
    	$('#saveAlertBad').hide();
    	$('#saveAlertGood').hide();
    })
    // ********** Login Stuff ****************
    $('#cancel').click(function() {
        $('#signInBox').hide();
    })
     $('#saveGame').click(function(){
    	saveGame();
    	return false;
    });
    $('#menu-toggle').click(function(){
    	$('#menu-toggle').hide();
    	if(Cookies.get('loggedIn') !== 'true'){
    		$('#saveGame').hide();
    	}else{
    		$('#saveGame').show();
    	}
    });
       $('#signIn').click(function() {
        if (checkForm($(this).closest('form'))) {
            var body = {}
            body.uname = $('#userName').val();
            body.password = $('#oldPassword').val();
            $.ajax({
                url: APIURL + '/login',
                method: 'POST',
                //  dataType: 'application/json',
                // contentType:'application/json',
                data: JSON.stringify(body),
                success: function(data, textStatus, res) {
                    //data = JSON.parse(data);
                    //console.log('data: ');
                    //console.log(data);
                    var auth = res.getResponseHeader('Authorization');
                    //console.log(auth);
                    Cookies.set('token', auth);

                    Cookies.set('userName', data.uname);
                    Cookies.set('level', data.level);
                    Cookies.set('loggedIn', true);
                    $('#signInNav').hide();
                    $('#signedInNav').show();
                    $('#saveGame').show();

                    $('#signedInNav div').text('Signed in as ' + data.uname);
                    startGame(levels[data.level]);

                },
                error: function(data, textStatus, res) {
                	$('#warningBelow').append('<div id="problem" class="col-md-12">Sorry, incorrect user info </div>')
                    //console.log("ERROR: ");
                    //console.log(data);
                    //console.log(textStatus);
                    //console.log(res);
                }

            })

        }

        return false;
    })



    
 $('#gameContainer').click(function(e) {
        if (click) {

            var x = ~~(e.offsetX / zoom - backgroundOffset.x);
            var y = ~~(e.offsetY / zoom - backgroundOffset.y);
            var entity;
            if (Math.floor(Math.random() * 2) === 0) { //50 50 chance
                entity = new Entity({
                    'x': x,
                    'y': y
                }, "img/characters/giant.png", 75);
            } else {
                entity = new Entity({
                    'x': x,
                    'y': y
                }, "img/characters/soldier.png", 25);
            }
            entities[entity.id] = entity;
            travelSouth(entity);

        } else click = false;

    })

    $('#levelSelect').click(function(){
        displayLevels("Choose a Level")
    	return false;


    })
      $('#signUp').click(function() {
        $('#signInForm').hide();
        $('#signUpForm').show();
        return false;

    })

    $('#cancelLevel').click(function(){
    	$('#prompt').hide();
    	$('#levelButtons').hide();
    	$('#signInBox').hide();

    	return false;
    })
     $('#signUpSubmit').click(function() {
        if (doubleCheck($(this).closest('form'))) {
            var body = {}
            body.uname = $(newUserName).val();
            body.email = $(newEmail).val();
            body.password = $(newPassword).val();
            $.ajax({
                //contentType: 'application/json',
                url: APIURL + '/register',
                method: 'PUT',
                //  dataType: 'application/json',
                data: JSON.stringify(body),
                success: function(data, textStatus, request) {
                    //  data = JSON.parse(data);
                    var auth = request.getResponseHeader('Authorization');
                    ////console.log(headers);
                    //Cookies.set('token', headers.authorization);
                    //console.log('data: ');
                    //console.log(data);
                    //console.log('auth:')
                    //console.log(auth)
                    ////console.log('token: ')
                    ////console.log(Cookies.get('token'));
                    Cookies.set('userName', data.uname);
                    Cookies.set('level', data.level);
                    Cookies.set('loggedIn', true);
                    Cookies.set('token', auth);

                    //  $('form').hide();

                    $('#signedInNav').show();
                    $('#signedInNav div').text('Signed in as ' + data.uname);
                    $('#signInForm').show();
                    $('#signUpForm').hide();
                    $('#saveGame').show();
                    $('#signInNav').hide();

                    startGame('theNeck', true);

                },
                error: function(data, textStatus, request) {
                    //console.log('testStatus: ' + textStatus);
                    //console.log('request:');
                    //console.log(request);
                    //console.log("ERROR: ");
                    //console.log(data);
                    $('#inputWarningBelow').append('<div id="problemSignUp" class="col-md-12">Sorry, that login is taken</div>')

                }

            })

        } else {
            //console.log('form problem');
        }

        return false;

    });
    $('#skip').click(function() {
        $('form').hide();
        $('#skip').hide();
        $('#levelButtons').show();
        $('#prompt').text('Choose a level');
    })

} //setUpEverything






$(function() {
	setUpEverything();
	$('#saveAlertBad').hide();
	$('#saveAlertGood').hide();
    $('#levelButtons').hide();
    $('#signedInNav').hide();
    Cookies.get('loggedIn') === 'true' ? $('#signInNav').hide() : $('#signInNav').show();
    $('#menu-toggle').hide();
    $('#cancel').hide();


    if (Cookies.get('loggedIn') === "true") {
        startGame(levels[Cookies.get('level')]);
        $('#signInNav').hide();
        $('#signedInNav').show();
        $('#signedInNav div').text('Signed in as ' + Cookies.get('userName'));

    }
   

 
    $('#cancelLevel').hide();

  

   

    // ************End Login

});

// ************** Login functions

function doubleCheck(form) {
    var val = checkForm(form);
    var val2 = matchingPasswords(form);
    return val && val2;
}

function matchingPasswords(form) {
    if ($("#newPassword").val() !== $("#newPasswordAgain").val()) {
        dangerInput($("#newPassword"));
        dangerInput($("#newPasswordAgain"));
        alert("Your passwords don't match");
        return false;
    } else if ($('#newPassword').val()) {
        removeDanger($("#newPassword"));
        removeDanger($("#newPasswordAgain"));
        return true;
    }

}

function checkForm(form) {
    var flag = true;

    form.find('input').each(function() {
        if (!$(this).val()) {
            dangerInput($(this));
            flag = false;
        } else {
            removeDanger($(this));
        }
    })
    return flag;
}

function dangerInput(field) {
    field.closest('.form-group').addClass('has-error');
    field.siblings('span').addClass('glyphicon-remove');
}

function removeDanger(field) {
    field.closest('.form-group').removeClass('has-error');
    field.siblings('span').removeClass('glyphicon-remove');
}

function blank(field) {
    alert($())
}
// End Login functions

function startGame(userLevel, overRide) {
	level = userLevel;

    $("#signInBox").hide();
    $("#initialDescription").hide();

    $("#background").fadeTo(100, 1, function() {
        $("#foreground").fadeTo(1, 1, function() {
            metaStartGame(overRide);
        });

    });

}
//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
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

$("#gameContainer").on('mousedown', function(e) {
    pressMap(e)
}).on('mouseup', function(e) {
    releasePressMap(e)
}).on('mousemove', function(e) {
    mapMove(e);
});
$("#gameContainer").on('touchstart', function(e) {
    pressMap(e, true)
}).on('touchend', function(e) {
    releasePressMap(e, true)
}).on('touchmove', function(e) {
    mapMove(e, true);
    return false;
});

function mapMove(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }
    var changeX = Math.abs(e.clientX - currentCoords.x);
    var changeY = Math.abs(e.clientY - currentCoords.y);

    if (!panning) {
        fullOnPanning = false;
    }

    if ((panning && (changeY > 5 || changeX > 5)) || fullOnPanning) {
        click = false;
        backgroundOffset.x += e.clientX - currentCoords.x;
        backgroundOffset.y += e.clientY - currentCoords.y;
        // backgroundChange = true;

        currentCoords.x = e.clientX;
        currentCoords.y = e.clientY;
        if ($('#gameContainer').css('cursor') != 'move') {
            $('#gameContainer').css('cursor', 'move');
        }
        fullOnPanning = true;

    } else {
        click = true;
    }

}

function releasePressMap(e, mobile) {
    panning = false;
    fullOnPanning = false;

    $('#gameContainer').css('cursor', 'auto');

}

function pressMap(e, mobile) {
    if (mobile) {
        e = e.touches[0];
    }
    currentCoords.x = e.clientX;
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


//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);

function isBlocked(x, y) {

    return blockingTerrain[~~(x / 32)][~~(y / 32)];

}

//End loading tiled maps

function startLevel() {


    if(Cookies.get('loggedIn') === 'true'){  //Only let the user see so many level buttons
        for(var lev in levels){
            $('#' + levels[lev]).hide()
        }

        for(var lev in levelsWon){
            $('#' + levelsWon[lev]).show()
        }
    }

    entity = new Entity({
                    'x': 0,
                    'y': 0
    }, "img/characters/blank.png", 75);
    entities.push(entity);


	$('#problem').remove();
	$('#problemSignUp').remove();
    $('#menu-toggle').show();
    if (Cookies.get('loggedIn') !== 'true') {
        $('#signInNav').show();
    }
 
    var mapHeight, mapWidth, canvasHeight, canvasWidth, mapYOffset, mapXOffset;

    $("#background").attr("height", $("#gameContainer").height());
    $("#background").attr("width", $("#gameContainer").width());
    $("#foreground").attr("height", $("#gameContainer").height());
    $("#foreground").attr("width", $("#gameContainer").width());
    var ctxB = $("#background")[0].getContext("2d");
    var ctxF = $("#foreground")[0].getContext("2d");




    var i = 0;
    ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics

    scene.load(level, ctxB, zoom);
    // backgroundChange = false;

    var entityTrack = 0;
    var entityOnBackground = false;
    var clearedF = false;
    if(!intervalSetMap){
    	intervalSetMap = true;
    	setInterval(function() {
	    	
	        entityTrack++;
	        // limitBackgroundOffset();
	        if (fullOnPanning || zoomHappened) {
	            if (fullOnPanning) {
	                pause = true;
	                if (!clearedF) {
	                    ctxF.clearRect(0, 0, ctxF.canvas.width, ctxF.canvas.height);
	                    clearedF = true;
	                }
	                scene.load(level, ctxB, zoom)
	                drawEntities(entities, ctxB, true, true);
	            } else if (zoomHappened) {
	                scene.load(level, ctxB, zoom);
	                drawEntities(entities, ctxF, true);
	                zoomHappened = false;
	            }

	            // backgroundChange = false;
	        } else if (entityTrack % entitySpeed === 0) { //simple way to animate entities, should be a better way (else if, entities are frozen when pan)
	            drawEntities(entities, ctxF);
	            /*drawEntities(entities.slice(quarter/ 4 * entities.length, (quarter + 1)/4 * entities.length - 1), ctxF);
	            quarter++;  //Ugg this would work if enties was an array, need to convert to array then back to object or reconfigure project var myarray = Array.prototype.slice.call(myobject, 1) 
	            quarter %= 4;*/
	        } else {

	            clearedF = false;
	            pause = false
	        }

	    }, 1000 / fps);
	}
}


function eraseEntityOnBackground(oldTop) {
    scene.layers[scene.layers.length - 1] = oldTop;
}

//I don't this limit  background is currently being used
function limitBackgroundOffset() {
    backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
    backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
    (levelWidth + backgroundOffset.x) * zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() / zoom - levelWidth : backgroundOffset.x;
    (levelHeight + backgroundOffset.y) * zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() / zoom - levelHeight : backgroundOffset.y;

}

/***************** Entities Start Here ***************************************/

function Entity(xyStart, png, health) {
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.png = png;
    this.health = health;
    this.directionPointing = 'E'; //N, W, E, S
    this.heading = {};
    this.heading.x = this.x;
    this.heading.y = this.y;
    this.action = 'defending'; //attacking, defending
    this.walking = true;
    this.walkingState = '0';
    this.alreadyBeen = [];
    this.alreadyBeen[this.x] = [];
    this.alreadyBeen[this.x][this.y] = true;
    this.size = 150;
    this.image = new Image();
    this.blank = new Image();
    this.blank.src = 'img/characters/blank.png'
    this.image.src = png;
    this.loaded = false;
    this.team = 'red'; // red or blue
    this.ai = false;
    // kim add
    this.current = false;
    this.fighting = false;
    this.pathStart = {};
    this.pathStart.x = 0;
    this.pathStart.y = 0;
    this.dest = [];
    this.dest.x = 0;
    this.dest.y = 0;
    this.dest.distance = 0;
    this.pathDist = 0;
    this.path = [];
    this.dijkstraGrid = []; 
    
    this.image.onload = function() {
        this.loaded = true;
    }
    for (var i = 0; i < 1000; i++) {
        if (!entities[i]) {
            this.id = i;
            break;
        }
    }

};



function travelSouth(entity) {

    entity.heading.y = entity.y + 1000;
    if(!entity.intervalSet){
    	entity.intervalSet = true;
	    setInterval(function() {
	        if (!pause) {
	            if (shouldGoThere(entity.x, entity.y + 5, entity)) {
	                addAlreadyBeen(entity);
	                entity.y += 5;
	                entity.directionPointing = 'S';

	            } else if (shouldGoThere(entity.x + 5, entity.y, entity)) {
	                addAlreadyBeen(entity);
	                entity.x += 5;
	                entity.directionPointing = 'E';
	            } else if (shouldGoThere(entity.x, entity.y - 5, entity)) {
	                addAlreadyBeen(entity);
	                entity.y -= 5;
	                entity.directionPointing = 'N';
	            } else if (shouldGoThere(entity.x - 5, entity.y, entity)) {
	                addAlreadyBeen(entity);
	                entity.x -= 5;
	                entity.directionPointing = 'W';
	            }

	        }
	    }, 250)
	}
}
    
    



function addAlreadyBeen(entity) {
    if (!entity.alreadyBeen[entity.x]) {
        entity.alreadyBeen[entity.x] = [];
    }
    entity.alreadyBeen[entity.x][entity.y] = true;
}

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 30, y) === true || isBlocked(x, y + 30) === true || isBlocked(x + 30, y + 30) === true) {
        return true;
    }
    return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}

function logOut() {
    Cookies.set('loggedIn', false);
    $('#signedInNav').hide();
    $('#signInNav').show();
  //  $('#saveGame').remove();
}

function signInNav() {
    $('#signInBox').show();
    $('#levelButtons').hide();
    $('#signUpForm').hide()
    $('#signInForm').show();
    $('#prompt').text('Sign In');
    $('#skip').hide();
    $('#cancel').show();
}



function saveGame() {
	if(Cookies.loggedIn === 'false'){
		$('$saveAlertBad').show();
		return;
	}
    var state = {};
    state.entities = {};

    state.entities = entities;

    player1.gold = 300;
    player1.team = 'red';
    player1.ai = true;
    player1.name = "player1"

    player2.gold = 200;
    player2.team = 'blue';
    player2.ai = false;
    player2.name = 'player2';
    var players = [player1, player2];
    state.baseN = baseN;
    state.baseS = baseS;
    state['baseNHealth'] = baseNHealth;
    state['baseSHealth'] = baseSHealth;
    state['players'] = players;
    state['level'] = level;
    state['levelsWon'] = levelsWon;
    var toSend = {};
    toSend.Name = new Date($.now()).getTime();
    //console.log(toSend.Name);
    toSend.Data = state;
    //console.log(toSend);

    //Change this when you want to pick saves
    toSend.Name = 'recent';

    $.ajax({
        url: APIURL + '/' + Cookies.get('userName') + '/save/' + toSend.Name,
        method: 'PUT',
        beforeSend: function(request){
        	request.setRequestHeader("Authorization", Cookies.get('token'));
        },//Authorization?
        //  dataType: 'application/json',
        // contentType:'application/json',
        data: JSON.stringify(state),
        success: function(data, textStatus, res) {
            //data = JSON.parse(data);
            //console.log('Reponse: ');
            //console.log(data);

            Cookies.set('saveName', toSend.Name);
            $('#saveAlertGood').show();



        },
        error: function(data, textStatus, res) {
            //console.log("ERROR: ");
            //console.log(data);
            $('#saveAlertBad').show();


        }

    })

    return JSON.stringify(state);

}

function loadGame(state){

	var theSave = Cookies.get('saveName');

	theSave = 'recent';  //Change me for more functionality

	    $.ajax({
        url: APIURL + '/' + Cookies.get('userName') + '/save/' + theSave,
        method: 'GET',
        beforeSend: function(request){
        	request.setRequestHeader("Authorization", Cookies.get('token'));
        },//Authorization?
        //  dataType: 'application/json',
        // contentType:'application/json',
        success: function(data, textStatus, res) {
            //data = JSON.parse(data);
            data = data.data;
            //console.log('Reponse: ');
            //console.log(data);
		    player1 = data.players[0];
			player2 = data.players[1];
			level = data.level;
			baseNHealth = data.baseNHealth;
			baseSHealth = data.baseSHealth;
			baseS = data.baseS;
			baseN = data.baseN;
			entities = data.entities;
            levelsWon = data.levelsWon;
			for(var entity in entities){
				entities[entity].image.loaded = false;
				entities[entity].image = new Image();
			    entities[entity].blank = new Image();
			    entities[entity].blank.src = 'img/characters/blank.png'
			    entities[entity].image.src = entities[entity].png;
			    entities[entity].intervalSet = false;
			    //travelSouth(entities[entity]); //won't need this
			}
			firstLoad = true;




			startLevel(true);


        },
        error: function(data, textStatus, res) {
            //console.log("ERROR: ");
            //console.log("text:", textStatus);
            //console.log('res', res);
            //console.log('data:')
            //console.log(data);  //server doesn't provid anything useful, grrr
            startGame(level, true);

           // alert('Error Loading Your Game! Sorry :(')
        }

    })


}
function kill(){ //Incase the program is out of control
	entities = [];
}

