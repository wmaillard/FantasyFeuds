var animationPerSecond = 5;
var boughtEntity = null;
var castleRadius = 2500;
var currentEntity = null;  //What entity is currently focused on in the window
var currentZoomResolution = 1;
var canvasWidth; 
var canvasHeight;
var characterImages = {};
var ctxB, ctxF, ctxI  //Foreground, background, and info context
var entities = {};
var firstLoad = true;  //If true then all the images will be loaded up and cached
var lastAnimation = Date.now();
var level = 'megaMap';
var levelWidth = 200;  //Dimensions of level in squares
var levelHeight = 100;
var newCan = document.createElement('canvas');  //Canvas used for drawing entities
var playerColor = "#208FE1"; 
var playerId;
var selectedEntities = {};
var serverSentFullState = false;
var size = 32;  //Width and height of map tile
var socket;
var zoom = 1; //starting zoom of map
var playerGold = 90;
var zoomSpeed = .10;  //How fast to zoom in/out
var zoomPanTimeoutRunning = false;
var zoomPanCompletelyDone = true;
var scores = {orange: 1000, blue: 1000};
var playerTeam = null;
var name = "";
var allPlayerInfo;
var tips = ['You can zoom in and out by pinching the screen or scrolling with the mouse wheel.', 'Capturing castles will earn you 3x as many points as killing enemies.', 'You can double tap the map to quickly zoom in and out.']
/*Test if android*/
var ua = navigator.userAgent.toLowerCase();
var isAndroid = ua.indexOf("android") > -1;
var limitRAM = false;
/*****************/

var rows = 1;  //Rows and columns map is broken up into
var columns = 1;


var backgroundOffset = {
        "x": -levelWidth * 32 + $('#gameContainer').width(),
        "y": -levelHeight * 32 + $('#gameContainer').height()
    } //Default offset view of map
var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning, used to compare old coords to new ones
