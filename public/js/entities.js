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
    this.path = [];
    this.id = Date.now();
    this.walking = true;
    this.walkingState = '0';
    this.size = characterImages[this.type].height / 4;
    this.height = characterImages[this.type].height / 4;
    this.width = characterImages[this.type].width / 3;
    if (Math.random() >= 0.5) {
        this.team = 'orange';
    } else {
        this.team = 'blue';
    }
};
