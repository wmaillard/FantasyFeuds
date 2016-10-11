//Globals

var APIURL = "https://got-rts.appspot.com";
var attacks = [];
var attackEffectsLoop = false;
var baseNHealth = 1000;
var baseSHealth = 1000;  //this will be moved when bases are turned into entities
var blockingTerrain = [];  //Things that you can't walk over
var boughtEntity = null;
var canvasWidth; 
var canvasHeight;
var characterImages = {};
var clearBackground = false;  //Should we clear the map
var click = true;  //Was it a quick click?
var ctxB;  //Foreground, background, and info context
var ctxF;
var ctxI;
var debugPathfinding = false;
var entities = {};
var entitiesLastNode = {};
var entitiesMap = []; //nodes that all the entities are on, currently only 15kB
var entitySpeed = fps * 2 / 5; // Walking speed of entities, probably change this at some point
var entitySize = .5;
var firstLoad = true;  //If true then all the images will be loaded up and cached
var fps = 20//This is just for panning
var fullOnPanning = false;  //Is the mouse held down and has it moved over 5px?
var level = 1;
var levelHeight;
var levels = ['theNeck', 'theNorth', 'dorne'];
var levelsWon = ['theNeck'];  //put this into player probably or just store server side eventually
var levelTitles = {theNeck: 'The Neck', theNorth: 'The North', dorne: 'Dorne'}
var levelWidth;
var mapInterval = false;  //Has the main drawing interval been set?
var panning = false;  //Is the mouse held down?
var player1 = {};
var player2 = {};
var playerColor = 'black'; //like my soul :)
var playerId;
var serverSentChange = false;
var size = 32;  //Get rid of this magic number
var socket;
var useMin = false; //use minimized images
var wasCtrl = false;
var windowResize = false;  //This hasn't been implemented yet
var zoom = 1; //starting zoom of map
var zoomHappened = true;
var tickRate = 30;  //hz  !!!This effects how sensitive clicks are because my server is slowwww
var attackEffects = {};
var panTime = 0;
var changeToSendToServer = false; //set to true everytime a change happens that needs to be sent out, now using a function, this is just for debugging
var sTime = 0;
var cTime = 0;
var waiting = false;
var oldBackgroundOffset = {x: 0, y: 0};
var attackRate = 1; //attacks checked per second
var playerGold = 1000;
var lastAnimation = Date.now();
var serverSentFullState = false;

var swipeRatio = 0.9;
// enable vibration support
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

var pixelChangeForPan = 5;
var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Default offset view of map

var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning

var entityNames = {
	'quarry': {'object': true},
	'dwarfSoldier': {'name': 'Dwarf Soldier', 'image': 'dwarfSoldierStore_o6dxmy.png', 'cost' : 50},
	'elfFemale' : {'name' : 'Elf Female', 'image' : 'elfFemaleStore_nrmwwu.png', 'cost' : 75},
	'humanSoldier' : {'name' : 'Human Soldier', 'image'  : 'humanSoldierStore_y97ypo.png', 'cost' : 120},
	'orcPeon' : {'name' : 'Orc', 'image' : 'orcPeonStore_dp53w5.png', 'cost' : 150}
}

//  http://res.cloudinary.com/ochemaster/image/upload/w_241,c_scale/v1475040587/orcPeonStore_dp53w5.png
//Load up entity images
for(var entity in entityNames){
	if(!entityNames[entity].object){
		entityNames[entity].image = 'http://res.cloudinary.com/ochemaster/image/upload/h_230,c_scale/v1475040587/' + entityNames[entity].image;
	}
	
	characterImages[entity] = new Image();
	characterImages[entity].src = 'img/characters/' + entity + '/' + entity + '.png';
	characterImages[entity + 'Pose'] = new Image();
	characterImages[entity + 'Pose'].src = 'img/characters/' + entity + '/' + entity+ 'Pose.png';


}

//Blank image for the wall, but you should get rid of this
characterImages.blank = new Image();
characterImages.blank.src = 'img/characters/blank.png';



CanvasRenderingContext2D.prototype.drawSafeImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight){
  if(!canvasWidth || !canvasHeight || windowResize){
    canvasWidth = $('#gameContainer').width();
    canvasHeight = $('#gameContainer').height();
  }
  if (dx  < canvasWidth && dy < canvasHeight && dx >= 0 && dy >= 0)
        this.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}
