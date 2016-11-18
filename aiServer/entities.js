function Entity(xyStart, health, type, playerId, healthbarColor, team) {
    this.attackType = 'sword'; //default to sword attack
    this.color = team
    this.playerId = playerId;
    this.type = type;
    this.x = xyStart.x;
    this.y = xyStart.y;
    this.health = health;
    this.heading = {x : xyStart.x, y: xyStart.y};
    this.attacking = false;
    this.gore = {};
    this.path = [];
    this.id = Date.now();
    this.walking = true;
    this.walkingState = '0';
    this.previousNode = {x : xyStart.x, y: xyStart.y};
    this.nextNode = {x : xyStart.x, y: xyStart.y};
    this.team = team;
    this.healthbarColor = healthbarColor;
};
exports.Entity = Entity;