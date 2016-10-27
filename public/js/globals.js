var animationPerSecond = 5;
var boughtEntity = null;
var currentEntity = null;  //What entity is currently focused on in the window
var canvasWidth; 
var canvasHeight;
var characterImages = {};
var ctxB, ctxF, ctxI  //Foreground, background, and info context
var entities = {};
var entitySize = .5;  //how big each entity appears on the map
var firstLoad = true;  //If true then all the images will be loaded up and cached
var lastAnimation = Date.now();
var level = 'megaMap';
var levelWidth = 1000;  //Dimensions of level in squares
var levelHeight = 1000;
var playerColor = 'black'; //like my soul :)
var playerId;
var selectedEntities = {};
var serverSentFullState = false;
var size = 32;  //Width and height of map tile
var socket;
var zoom = 1; //starting zoom of map
var playerGold = 1000;
var zoomSpeed = .10;  //How fast to zoom in/out


var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Default offset view of map
var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning, used to compare old coords to new ones
