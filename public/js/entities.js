
function Entity(xyStart, health, type, playerId, color) {
    this.color = color
    this.playerId = playerId;
    this.type = type;
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.health = health;
    this.directionPointing = 'E'; //N, W, E, S
    this.heading = {};
    this.heading.x = this.x;
    this.heading.y = this.y;
    this.action = 'defending'; //attacking, defending
    this.walking = false;
    this.walkingState = '0';
/*    this.alreadyBeen = [];
    this.alreadyBeen[this.x] = [];
    this.alreadyBeen[this.x][this.y] = true;*/
    this.size = 150;

    this.loaded = true; //Need to check if relavent
    this.team = 'red'; // red or blue
    this.ai = false;
    // kim add
    this.selected = false;
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
<<<<<<< HEAD
=======
    this.dijkstraGrid = []; 
    this.nextNode = false;


>>>>>>> origin/master
    

    for (var i = 0; i < 1000; i++) {
        if (!entities[i]) {
            this.id = i;
            break;
        }
    }

};
