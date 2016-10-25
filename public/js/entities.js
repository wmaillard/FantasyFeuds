
function Entity(xyStart, health, type, playerId, color) {
    this.attackType = 'sword'; //extend this sometime
    this.color = color
    this.playerId = playerId;
    this.type = type;
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.health = health;
    this.directionPointing = 'S'; //N, W, E, S
    this.heading = {};
    this.heading.x = this.x;
    this.heading.y = this.y;
    this.attacking = false;
    this.gore = {};
    this.movedCount = 0;
    this.walking = true;
    this.walkingState = '0';
/*    this.alreadyBeen = [];
    this.alreadyBeen[this.x] = [];
    this.alreadyBeen[this.x][this.y] = true;*/
    this.size = characterImages[this.type].height / 4; //obsolete

    this.height = characterImages[this.type].height / 4;//obsolete
    this.width = characterImages[this.type].width / 3;//obsolete

    this.loaded = true; //Need to check if relavent
    if (Math.random() >= 0.5){
        this.team = 'orange';
    }else{
        this.team = 'blue';
    }
    this.ai = false; //not used
    // kim add
    this.selected = false;
    this.fighting = false;  //obsolete
    this.pathStart = {};
    this.pathStart.x = 0;
    this.pathStart.y = 0;
    this.dest = []; //don't know if used
    this.dest.x = 0;//don't know if used
    this.dest.y = 0;//don't know if used
    this.dest.distance = 0; //don't know if used
    this.pathDist = 0;//don't know if used
    this.path = [];
    

    this.id = Date.now();



};
