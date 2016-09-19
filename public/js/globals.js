//Globals

var APIURL = "https://got-rts.appspot.com";
var attacks = [];
var baseNHealth = 1000;
var baseSHealth = 1000;  //this will be moved when bases are turned into entities
var blockingTerrain = [];  //Things that you can't walk over
var characterImages = {};
var clearBackground = false;  //Should we clear the map
var click = true;  //Was it a quick click?
var ctxB;  //Foreground, background, and info context
var ctxF;
var ctxI;
var debugPathfinding = false;
var entities = [];
var entitiesLastNode = {};
var entitiesMap = []; //nodes that all the entities are on, currently only 15kB
var entitySpeed = fps * 2 / 5; // Walking speed of entities, probably change this at some point
var firstLoad = true;  //If true then all the images will be loaded up and cached
var fps = 5//This is just for panning
var fullOnPanning = false;  //Is the mouse held down and has it moved over 5px?
var level = 0;
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
var useMin = true; //use minimized images
var wasCtrl = false;
var zoom = 1; //starting zoom of map
var zoomHappened = false;
var canvasWidth; 
var canvasHeight;
var windowResize = false;  //This hasn't been implemented yet

characterImages.blank = new Image();
characterImages.blank.src = 'img/characters/blank.png';
characterImages.giant = new Image();
characterImages.giant.src = 'img/characters/giant.png';
characterImages.soldier = new Image();
characterImages.soldier.src = 'img/characters/soldier.png';


CanvasRenderingContext2D.prototype.drawSafeImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight){
  if(!canvasWidth || !canvasHeight || windowResize){
    canvasWidth = $('#background').width();
    canvasHeight = $('#background').height();
  }
  if (dx  < canvasWidth && dy < canvasHeight && dx > 0 && dy  > 0)
        this.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}
