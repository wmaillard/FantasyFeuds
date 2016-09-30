



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
    for (var entity in entityNames){
        $('#shop > .card-deck').append('<div class="card text-xs-center" id = ' + entity + '><img class="card-img-top" src="' + entityNames[entity].image + '" alt="Card image cap"><div class="card-block text-xs-center"><h4 class="card-title">' + entityNames[entity].name + '</h4><p class="card-text">Soldiers a strong attackers and defenders.  They are weak against magic and dragons</p><p class="card-text"><small class="text-muted">' + entityNames[entity].cost + ' Gold Pieces</p><button type="button" class="btn btn-success buy">Buy</button><button type="button" class="btn btn-info stats">Stats</button></div>')
    }
}

$(function() {
    $( window ).on( "swipe", function( event ) { alert('swipe') } )
	buildStore();
    playerColor = getRandomColor();
    BindButtons.bindAll();

    //add this to bindbutton eventually
    $('.buy').each(function(){
        $(this).click(function(){
            console.log('hey');
            boughtEntity = this.closest('.card').id;
            $('#shop').hide();
            return false;
        })
    })
    $('#showShop').click(function(){
        $('#shop').show();
        return false;
    });

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
    var oldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));
    setInterval(function(){
        /*if(serverSentChange){
            serverSentChange = false;
        }

else*/ 
        var newOldEntities = JSON.stringify(onlyPlayerEntities(entities, playerId));
        if(newOldEntities !== oldEntities || attacks.length > 0){
            oldEntities = newOldEntities;
            //can I send oldEntities instead of onlyPlayerEntities
            socket.emit('clientEntities', {entities: onlyPlayerEntities(entities, playerId), attacks: attacks});
            attacks = [];
            //console.log('Sent the server some info');
            //console.log('attacks: ');
            //console.log(attacks);
            //console.log(onlyPlayerEntities(entities, playerId));
        }

    }, 1000 / tickRate)
    
/*    setInterval(function(){
    	moveEntities();
    }, 250);*/
    
    startGame('dorne');


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
	    	                    
            backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Make sure not to pan outside of map
            backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
            $('#gameContainer').width() - backgroundOffset.x > levelWidth * size ? backgroundOffset.x = $('#gameContainer').width() - levelWidth * size  : null;
            $('#gameContainer').height() - backgroundOffset.y > levelHeight * size ? backgroundOffset.y = $('#gameContainer').height() - levelHeight * size  : null;
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










