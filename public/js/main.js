//GLOBALS
var APIURL = "https://got-rts.appspot.com"; //"http://httpbin.org/post" // 
var useMin = true; //use minimized images
var fps = 30//This is just for panning
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

$(function() {
    BindButtons.bindAll();

    
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







$("#gameContainer").on('mousedown', function(e) {
    pressMap(e)
}).on('mouseup', function(e) {
    releasePressMap(e)
}).on('mousemove', function(e) {
    mapMove(e);
});
$("#foreground").on('touchstart', function(e) {
    pressMap(e, true)
    return false;
}).on('touchend', function(e) {
    releasePressMap(e, true);
    return false;
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
    if (isBlocked(x, y) === true || isBlocked(x + 18, y) === true || isBlocked(x, y + 18) === true || isBlocked(x + 18, y + 18) === true) {
        return true;
    }
    return false;
}

function shouldGoThere(x, y, entity) {
    return (entityIsBlocked(x, y) !== true && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
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
			    travelSouth(entities[entity]); //won't need this
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



function gameOver() { //need to work on this
    if (baseNHealth <= 0){
        //console.log("You Win!");
        if(levelsWon.length < 3){
            displayLevels('Congratulations! You Beat ' + levelTitles[level] + '.  Select your next level');
        }else{
            displayLevels('Congratulations! You Have Conquered the Seven Kingdoms! Care To Replay a Level?');
        }
        $('#cancelLevel').hide();
        if(Cookies.get('loggedIn') === 'true'){
            for(var lev in levels){
                $('#' + levels[lev]).hide()
            }

            var levelNumber = $.inArray(level, levels);
            //console.log(levelNumber);
            levelNumber++;
            levelNumber %= 3;
            var nextLevel = levels[levelNumber]

            if($.inArray(nextLevel, levelsWon) === -1){
                levelsWon.push(nextLevel);
            }

            for(var lev in levelsWon){
                $('#' + levelsWon[lev]).show()
            }
        }
        // figure out how to end game
    }
    else if (baseSHealth <= 0){
        //console.log("You Lose!");
        displayLevels('Sorry You Failed While Trying to Conquer ' + levelTitles[level] + '.  Select your next level');
        $('#cancelLevel').hide();
       if(Cookies.get('loggedIn') === 'true'){
            for(var lev in levels){
                $('#' + levels[lev]).hide()
            }

            for(var lev in levelsWon){
                $('#' + levelsWon[lev]).show()
            }
        }

    }
    else{
        return false;
    }

}
