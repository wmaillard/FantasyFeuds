


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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
function onlyPlayerEntities(entities, playerId){
	var playerEntities = [];
	for(var entity in entities){
		if(entities[entity].playerId === playerId){
			playerEntities.push(entities[entity]);
		}
	}
	return playerEntities;
}
$(function() {
	
    playerColor = getRandomColor();
    BindButtons.bindAll();

    if (Cookies.get('loggedIn') === "true") {
        startGame(levels[Cookies.get('level')]);
        $('#signInNav').hide();
        $('#signedInNav').show();
        $('#signedInNav div').text('Signed in as ' + Cookies.get('userName'));

    }

    $("#background").attr("height", window.innerHeight);
    $("#background").attr("width", window.innerWidth);
    $("#foreground").attr("height", window.innerHeight);
    $("#foreground").attr("width", window.innerWidth);
    $("#info").attr("height", window.innerHeight);
    $("#info").attr("width", window.innerWidth);   
    ctxF = $("#foreground")[0].getContext("2d");
    ctxB = $("#background")[0].getContext("2d");
    ctxI = $("#info")[0].getContext("2d");


    socket = io();
    
    socket.on('allEntities', function(serverEntities){
        serverSentChange = true;
        for(var entity in serverEntities){
            if(serverEntities[entity].selected === true && serverEntities[entity].playerId !== playerId){
                serverEntities[entity].selected = false;
            }
        }
        entities = serverEntities;

    })
    socket.on('ping', function(response){
    	//console.log(response);
    })
    socket.on('connect', function(){
    	playerId = socket.id;
    })
    var oldEntities = JSON.stringify(entities);
    setInterval(function(){
        if(serverSentChange){
            serverSentChange = false;
        }
        else if(JSON.stringify(entities) !== oldEntities || attacks.length > 0){
            oldEntities = JSON.stringify(entities);
            socket.emit('clientEntities', {entities: onlyPlayerEntities(entities, playerId), attacks: attacks});
            attacks = [];
            //console.log('Sent the server some info');
            //console.log('attacks: ');
            //console.log(attacks);
            //console.log(onlyPlayerEntities(entities, playerId));
        }

    }, 10)
    
/*    setInterval(function(){
    	moveEntities();
    }, 250);*/
    
    startGame('theNorth');


    // ************End Login

});

// ************** Login functions


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
    ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics

    scene.load(level, ctxB, zoom);

    var entityTrack = 0;
    var entityOnBackground = false;
    var clearedF = false;
    if(!mapInterval){


    	mapInterval = setInterval(function() {
	    	
	        entityTrack++;
	        // limitBackgroundOffset();
	        if (fullOnPanning || zoomHappened) {
	            if (fullOnPanning) {
	                if (!clearedF) {
	                    ctxF.clearRect(0, 0, ctxF.canvas.width, ctxF.canvas.height);
	                    clearedF = true;
	                }

	                scene.load(level, ctxB, zoom);  //drawing all layers, could flatten, bug



                    drawEntities(entities, ctxF, true);

                    backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
                     backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;






                    if(debugPathfinding){
                        AI.drawTestDots(blockingTerrain, ctxI);
                    }
	                //drawEntities(entities, ctxB, true, true);

	            } else if (zoomHappened) {
	                scene.load(level, ctxB, zoom);
	                drawEntities(entities, ctxF, true);
	                zoomHappened = false;
                    if(debugPathfinding){
                        AI.drawTestDots(blockingTerrain, ctxI);
                    }
	            }

	        } 
	        else {
			drawEntities(entities, ctxF);
	         //drawEntities(entities, ctxF);
	         }
	        

	    }, 1000 / fps);
	}
}



function isBlocked(x, y) {
    return blockingTerrain[~~(x / 32)][~~(y / 32)];
}







