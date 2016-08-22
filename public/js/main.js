//GLOBALS
var APIURL = "https://got-rts.appspot.com"; //"http://httpbin.org/post" // 



var levels = ['theNeck', 'theNorth', 'dorne'];
var levelTitles = {
    theNeck: 'The Neck',
    theNorth: 'The North',
    dorne: 'Dorne'
}
var levelsWon = ['theNeck'];  //put this into player probably or just store server side eventually

var player1 = {};
var player2 = {};

var baseSHealth = 1000;  //this will be moved when bases are turned into entities
var baseNHealth = 1000;

var mapInterval = false;  //Has the main drawing interval been set?



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

$(function() {
    BindButtons.bindAll();

    if (Cookies.get('loggedIn') === "true") {
        startGame(levels[Cookies.get('level')]);
        $('#signInNav').hide();
        $('#signedInNav').show();
        $('#signedInNav div').text('Signed in as ' + Cookies.get('userName'));

    }

    $("#background").attr("height", $("#gameContainer").height());
    $("#background").attr("width", $("#gameContainer").width());
    $("#foreground").attr("height", $("#gameContainer").height());
    $("#foreground").attr("width", $("#gameContainer").width());
    $("#info").attr("height", $("#gameContainer").height());
    $("#info").attr("width", $("#gameContainer").width());   
    ctxF = $("#foreground")[0].getContext("2d");
    ctxB = $("#background")[0].getContext("2d");
    ctxI = $("#info")[0].getContext("2d");



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
	                scene.load(level, ctxB, zoom)
	                drawEntities(entities, ctxB, true, true);
	            } else if (zoomHappened) {
	                scene.load(level, ctxB, zoom);
	                drawEntities(entities, ctxF, true);
	                zoomHappened = false;
	            }

	        } else if (entityTrack % entitySpeed === 0) { //simple way to animate entities, should be a better way (else if, entities are frozen when pan)
	            console.log('Yo');
                drawEntities(entities, ctxF);
	            /*drawEntities(entities.slice(quarter/ 4 * entities.length, (quarter + 1)/4 * entities.length - 1), ctxF);
	            quarter++;  //Ugg this would work if enties was an array, need to convert to array then back to object or reconfigure project var myarray = Array.prototype.slice.call(myobject, 1) 
	            quarter %= 4;*/
	        } else {

	            clearedF = false;
	        }

	    }, 1000 / fps);
	}
}










