
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