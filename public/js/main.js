



//This start game and metastart game is stupid, and not relevant anymore
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
function buildStore(){
    var navHeight = $('nav').outerHeight();
    $('#shop').css({'margin-top':navHeight});
    $('#shop .card-deck').css('margin-bottom', navHeight).css('margin-top', navHeight * .25);
    for (var entity in entityInfo){
        if(!entityInfo[entity].object && !entityInfo[entity].animal){
            $('#shop > .card-deck').append('<div class="card text-xs-center" id = ' + entity + '><img class="card-img-top" src="' + entityInfo[entity].image + '" alt="Card image cap"><div class="card-block text-xs-center"><h4 class="card-title">' + entityInfo[entity].name + '</h4><p class="card-text">Soldiers a strong attackers and defenders.  They are weak against magic and dragons</p><p class="card-text"><small class="text-muted">' + entityInfo[entity].cost + ' Gold Pieces</p><button type="button" class="btn btn-success buy">Buy</button><button type="button" class="btn btn-info stats">Stats</button></div>')
        }
    }
}
function getTanDeg(deg) {
  var rad = deg * Math.PI/180;
  return Math.tan(rad);
}

var zoomSpeed = .10;

function slideMap(slope){
    if(slope > 0){
        backgroundOffset.x += 10;
        backgroundOffset.y = backgroundOffset.x * slope + backgroundOffset.x;
    }else{
        backgroundOffset.x -= 10;
        backgroundOffset.y = backgroundOffset.x * slope + backgroundOffset.x;

    }
    redrawBackground();
}
function convertScreenToMapPoint(x, y, zoom){ //tested, seems right
    //screen x, y
    var mapPoint = {x: x / zoom - backgroundOffset.x,
                    y: y / zoom - backgroundOffset.y 
                }
    return mapPoint;
}
function mapToScreenPoint(x, y){ //tested, seems right
    //screen x, y
    var screenPoint = {x: x * zoom + backgroundOffset.x * zoom,
                    y: y * zoom + backgroundOffset.y * zoom
                }
    return screenPoint;
}

function setBackgroundOffsetToScreenPoint(sx, sy, z1, z2){
    //sx, sy-> screen points
    //z1, z2 ->original and final zoom
    var mapPoint = convertScreenToMapPoint(sx, sy, z1);
    backgroundOffset.x = (sx - mapPoint.x * z2) / z2;
    backgroundOffset.y = (sy - mapPoint.y * z2) / z2;



}

function zoomAction(e){
        // do something cool

        var scale = e.scale;
 

        var oldZoom = zoom;
        if(scale > 1){
            scale = 1 - (1 - scale) * zoomSpeed // .9 becomes .95, 1.1 becomes 1.05
        }else{
            scale = 1 - (1 - scale) * zoomSpeed * 2
        }
        zoom *= scale;
    	while(levelWidth * size * zoom < $('#gameContainer').width() || levelHeight * size * zoom < $('#gameContainer').height()){
			zoom += 0.001
        }

        if(zoom > 3){
            zoom = 3;
        }


        //zoomHappened = true;      


      /* backgroundOffset.x -= backgroundOffset.x * zoom / oldZoom; 
        backgroundOffset.y -= backgroundOffset.y * zoom / oldZoom;*/


        setBackgroundOffsetToScreenPoint(e.center.x, e.center.y, oldZoom, zoom);

        limitBackgroundOffset();
        redrawBackground();
        

}

function zoomAndCheck(center){
    if(zoom < 2){
        zoomAction({scale : 1.1, center : center});
        setTimeout(zoomAndCheck(center), 1000/30);
    }

}


function doubleClickZoom(e){
    //console.log(e.originalEvent.clientX);
    //console.log(convertScreenToMapPoint(e.originalEvent.clientX, e.originalEvent.clientY, zoom));
    //setTimeout(zoomAndCheck(convertScreenToMapPoint(e.originalEvent.clientX, e.originalEvent.clientY,)), 1000/30)
}

function bottomNavCenter(){
    var leftMargin = canvasWidth * .46  - $('#allEntities').outerWidth() / 2 - $('#previousEntity').outerWidth();
    console.log(leftMargin);
    $('#allEntities').css({marginLeft: leftMargin});
}

$(function() {

	var $gameContainer = $('#gameContainer');
    canvasWidth = $gameContainer.width();
    canvasHeight = $gameContainer.height();

    bottomNavCenter();

    $( window ).resize(function() {
        $("#background").attr("height", window.innerHeight);  //innerWidth may not be right...
        $("#background").attr("width", window.innerWidth);
        $("#foreground").attr("height", window.innerHeight);
        $("#foreground").attr("width", window.innerWidth);
        $("#info").attr("height", window.innerHeight);
        $("#info").attr("width", window.innerWidth);   
        $("#explosions").attr("height", window.innerHeight);
        $("#explosions").attr("width", window.innerWidth);  
        ctxF = $("#foreground")[0].getContext("2d");
        ctxB = $("#background")[0].getContext("2d");
        ctxI = $("#info")[0].getContext("2d");
        canvasWidth = $('#gameContainer').width();
        canvasHeight = $('#gameContainer').height();
        bottomNavCenter();
        limitBackgroundOffset();
        redrawBackground();

    });
/*	var sum = 0;
for(var j = 0; j < 1000; j++){
	var n = performance.now();
	var p; 
	for(var i = 0; i < 100000; i++){p *= p * p};
	n = performance.now() - n;
	sum += n;
}
console.log(sum / 1000);
	
var sum = 0;
for(var j = 0; j < 5000; j++){
	var n = performance.now();
	var p; 
	for(var i = 0; i < 100000; i++){p *= p * p};
	n = performance.now() - n;
	sum += n;
}
alert('Your performance: ' + sum / 5000);*/
	
	// get a reference to an element
	var stage = document.getElementById('gameContainer');
    var stage2 = document.getElementById('background');

	// create a manager for that element
	var mc = new Hammer.Manager(stage);
    var mc2 = new Hammer.Manager(stage2);

	// create a recognizer
	var pinch = new Hammer.Pinch();
    var swipe = new Hammer.Swipe();

    var pan = new Hammer.Pan();
    var singleTap = new Hammer.Tap({event: 'singletap', taps: 1});
    var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});

    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure(doubleTap);

	// add the recognizer
	mc.add(pinch);
    mc.add(swipe);
    mc.add(singleTap);
    mc.add(pan);
    mc.add(doubleTap);

    mc.on('swipe', function(e){
        //e.angle
        //e.overallVelocity (- or +)
        var slope = getTanDeg(e.angle);
        //slideMap(slope);     
        console.log(slope);
    });

    mc.on('singletap', function(e){

        if(e.tapCount === 1){
            clickGameContainer(e);
        }
        else if(e.tapCount === 2){
            var point = convertScreenToMapPoint(e.center.x, e.center.y, zoom);
            if(zoom > .95){
                zoomToOne(point.x, point.y, 0.1)

            }else{
                
                zoomPanTo(point.x, point.y, zoom);
            }
        }


    });
    mc.on('pan', function(e){
        mapMove(e);
        redrawBackground();

    });
    mc.on('panstart', function(e){
        mapMove(e);
        redrawBackground();
    });
    mc.on('panend', function(e){
        mapMove(e);
        redrawBackground();
    });
  /*  mc.on('doubletap', function(e){
        console.log('doubletap');

    })*/




	
	mc.get('pinch').set({ enable: true });

	mc.on('pinch', function(e){
        console.log('pinching')
        zoomAction(e);
    });

	
	buildStore();
    playerColor = getRandomColor();
    BindButtons.bindAll();


 


    if (Cookies.get('loggedIn') === "true") {
        startGame(levels[Cookies.get('level')]);
        $('#signInNav').hide();
        $('#signedInNav').show();
        $('#signedInNav div').text('Signed in as ' + Cookies.get('userName'));

    }
    $("#background").attr("height", window.innerHeight);  //innerWidth may not be right...
    $("#background").attr("width", window.innerWidth);
    $("#foreground").attr("height", window.innerHeight);
    $("#foreground").attr("width", window.innerWidth);
    $("#info").attr("height", window.innerHeight);
    $("#info").attr("width", window.innerWidth);   
    $("#explosions").attr("height", window.innerHeight);
    $("#explosions").attr("width", window.innerWidth);  
    ctxF = $("#foreground")[0].getContext("2d");
    ctxB = $("#background")[0].getContext("2d");
    ctxI = $("#info")[0].getContext("2d");




    socket = io();

    socket.on('playerInfo', function(data){
        //console.log(data);
        playerGold = data[playerId].gold;
        $('#playerGold span').text(" " + data[playerId].gold)
    });

    socket.on('changes', function(changes){


                for(var i in changes){
                    if(entities[i]){
                        for(var j in changes[i]){
                            entities[i][j] = changes[i][j]
                        }
                    }else{
                        entities[i] = changes[i];
                    }
                    
                }
               
            
    })




    socket.on('allEntities', function(serverEntities){
    serverSentFullState = true;
	if(changeToSendToServer){
		console.log('missed a change');
	}
        serverSentChange = true;
        var selected = entityIsSelected();
        var objSelected = {};  //urg got to change entities to an obj
        for(var i in selected){
            objSelected[selected[i].id] = true;
        }
        for(var entity in serverEntities){
            if(!serverEntities[entity].dead && objSelected[serverEntities[entity].id] ===  true){
                serverEntities[entity].selected = true;
            }else{
                serverEntities[entity].selected = false;
            }

        }
        oldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));
        entities = serverEntities;

    })
    socket.on('ping', function(response){
    	//console.log(response);
    })
    socket.on('connect', function(){
    	playerId = socket.id;
    })
    var oldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));
   // setTimeout(sendToServer, 1000 / tickRate);
    
/*    setInterval(function(){
    	moveEntities();
    }, 250);*/
    
    startGame('megaMap');


    // ************End Login

});

// ************** Login functions


// End Login functions


function sendToServer(){
        //var newOldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));  // are these in a sorted order???!

        if(changeToSendToServer){
           /* console.log('new: ', newOldEntities);
            console.log('old: ', oldEntities);*/
            console.log('sent');
            //oldEntities = newOldEntities;
            socket.emit('clientEntities', {entities: onlyPlayerEntities(entities, playerId), attacks: attacks});
            attacks = [];
            changeToSendToServer = false;

        }
	//setTimeout(sendToServer, 1000 / tickRate);

    }
 
 
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



//End loading tiled maps

function startLevel() {

    socket.emit('attacks', {attacks: attacks}); //cheater way of requesting entities
    if(Cookies.get('loggedIn') === 'true'){  //Only let the user see so many level buttons
        for(var lev in levels){
            $('#' + levels[lev]).hide()
        }

        for(var lev in levelsWon){
            $('#' + levelsWon[lev]).show()
        }
    }

   /* entity = new Entity({
                    'x': 0,
                    'y': 0
    }, "img/characters/blank.png", 75);
    entities.push(entity);*/


	$('#problem').remove();
	$('#problemSignUp').remove();
    $('#menu-toggle').show();
    if (Cookies.get('loggedIn') !== 'true') {
        $('#signInNav').show();
    }
 



    var mapHeight, mapWidth, canvasHeight, canvasWidth, mapYOffset, mapXOffset;





    var i = 0;
    //ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics

    scene.load(level, ctxB, zoom);


 /*   var checkAttacks = setInterval(function(){
		//var onlyPlayer = onlyPlayerEntities(entities, playerId);
	    for(entity in entities){
            entities[entity].attacking = false;
			if(!entities[entity].dead){
				attackableEntities(entities[entity], entitiesMap)
			};
		}
		if(attacks.length > 0){
			socket.emit('attacks', {attacks: attacks});
			attacks = [];
		}

    }, 1000 / attackRate);*/


   	window.requestAnimationFrame(drawFrame);


}

var clearedF = false;
var frameCount = 0;
var entitiesChanged = true;

var lastAnimation = 0;
var animationPerSecond = 3;

function drawFrame() {
 	                    

	        limitBackgroundOffset();


		if(Date.now() > lastAnimation + 1000 / animationPerSecond || serverSentFullState){
			lastAnimation = Date.now();
			serverSentFullState = false;
			for(var e in entities){
				if(isInWindow(entities[e].x, entities[e].y)){
					animateEntity(entities[e]);
				}
			}
		}

		if(entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight){
				drawEntities(entities, ctxF, true);
		}
		window.requestAnimationFrame(drawFrame); 


	   
	
	        

   }




function zoomNow(){
    scene.load(level, ctxB, zoom);
   if(entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight){
            drawEntities(entities, ctxF, true);
        }
    zoomHappened = false;
     if(debugPathfinding){
             AI.drawTestDots(blockingTerrain, ctxI);
     }
}
function redrawBackground(){
    if (!clearedF) {
        ctxF.clearRect(0, 0, ctxF.canvas.width, ctxF.canvas.height);
        clearedF = true;
    }

    scene.load(level, ctxB, zoom);  //drawing all layers, could flatten, bug
       if(entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight){
            drawEntities(entities, ctxF, true);
        }

     if(debugPathfinding){
        AI.drawTestDots(blockingTerrain, ctxI);
     }
}




