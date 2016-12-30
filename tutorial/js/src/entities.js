function Entity(xyStart, health, type, playerId, color, id) {
    this.attackType = 'sword'; //extend this sometime
    this.color = color;
    this.playerId = playerId;
    this.type = type;
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.health = health;
    this.directionPointing = 'S'; //N, W, E, S
    this.heading = {x : xyStart.x, y: xyStart.y};
    this.attacking = false;
    this.gore = {};
    this.path = [];
    this.id = id;
    this.walking = true;
    this.walkingState = '0';
    this.size = characterImages[this.type].height / 4;
    this.height = characterImages[this.type].height / 4;
    this.width = characterImages[this.type].width / 3;
    this.previousNode = {x : xyStart.x, y: xyStart.y};
    this.nextNode = {x : xyStart.x, y: xyStart.y};
    this.team = color;
};
