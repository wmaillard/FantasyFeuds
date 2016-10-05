



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
    var navHeight = $('nav').height();
    $('#shop').css({'margin-top':navHeight * 1.5});
    for (var entity in entityNames){
        $('#shop > .card-deck').append('<div class="card text-xs-center" id = ' + entity + '><img class="card-img-top" src="' + entityNames[entity].image + '" alt="Card image cap"><div class="card-block text-xs-center"><h4 class="card-title">' + entityNames[entity].name + '</h4><p class="card-text">Soldiers a strong attackers and defenders.  They are weak against magic and dragons</p><p class="card-text"><small class="text-muted">' + entityNames[entity].cost + ' Gold Pieces</p><button type="button" class="btn btn-success buy">Buy</button><button type="button" class="btn btn-info stats">Stats</button></div>')
    }
}

$(function() {
	
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
        console.log(data);
        $('#playerGold').html('<img src="http://res.cloudinary.com/ochemaster/image/upload/c_scale,h_50/v1475689538/11-512_naajvi.png">' + " " + data[playerId].gold)
    });
    socket.on('allEntities', function(serverEntities){
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
    
    startGame('dorne');


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
    ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics

    scene.load(level, ctxB, zoom);


    var checkAttacks = setInterval(function(){
		var onlyPlayer = onlyPlayerEntities(entities, playerId);
	    for(entity in onlyPlayer){
			if(!onlyPlayer[entity].dead){
				attackableEntities(onlyPlayer[entity], entitiesMap)
			};
		}
		if(attacks.length > 0){
			socket.emit('attacks', {attacks: attacks});
			attacks = [];
		}

    }, 1000 / attackRate);


   	window.requestAnimationFrame(drawFrame);


}

var clearedF = false;
var frameCount = 0;
var entitiesChanged = true;

function drawFrame() {
 	                    
            backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x; //Move this to where backgroundOffset is set?
            backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;
            $('#gameContainer').width() - backgroundOffset.x > levelWidth * size * zoom ? backgroundOffset.x = $('#gameContainer').width() - levelWidth * size * zoom : null;
            $('#gameContainer').height() - backgroundOffset.y > levelHeight * size * zoom? backgroundOffset.y = $('#gameContainer').height() - levelHeight * size * zoom : null;
	        // limitBackgroundOffset();

	            if (fullOnPanning) {
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
        			 window.requestAnimationFrame(drawFrame);   
        			 return true;
	                //drawEntities(entities, ctxB, true, true);

	            } else if (zoomHappened) {
	                scene.load(level, ctxB, zoom);
                   if(entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight){
                            drawEntities(entities, ctxF, true);
                        }
	                zoomHappened = false;
                   	 if(debugPathfinding){
                       		 AI.drawTestDots(blockingTerrain, ctxI);
                   	 }
        			window.requestAnimationFrame(drawFrame);   
        			return true;

	            }else{
                    if(entitiesMap.length == levelWidth && entitiesMap[levelWidth - 1].length == levelHeight){
                            drawEntities(entities, ctxF, true);
                    }
                window.requestAnimationFrame(drawFrame); 
            }

	   
	
	        

   }










