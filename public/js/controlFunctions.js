var panning = false;  //Is the mouse held down?
var fullOnPanning = false;  //Is the mouse held down and has it moved over 5px?
var zoomHappened = false;
var click = false;  //Any kind of click?

var backgroundOffset = {
        "x": 0,
        "y": 0
    } //Default offset view of map

var currentCoords = {
        'x': 0,
        'y': 0
    } //Mouse coordinates, these are for panning
 

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


function kill(){ //Incase the program is out of control
    entities = [];
}
