var moveEntities = { //Currently mutates entities
    microMove: 4, //How far each step for an entity is per tick.  Could make entity specific, should be relative to tickrate
    changes: {},
    entities: {},
    setChange(entityId, key, value) {
        if (key === 'wholeEntity') {
            this.entities[entityId] = value;
            this.changes[entityId] = value;
        } else {
            this.entities[entityId][key] = value;
            if (!this.changes[entityId]) {
                this.changes[entityId] = {};
            }
            this.changes[entityId][key] = value;
        }
    },
    moveEntities(entities) { //This is global scope for some reason, maybe because it is called
        moveEntities.changes = {};
        if (!moveEntities.microMove){
            return {};
        }
        moveEntities.entities = entities;
        //NextNode is actually the current node, but called nextNode because currentNode should be derived from x, y
        //Previous node is the previous node
        //These two are used for animation of direction facing
        var howClose = moveEntities.microMove + 1;
        var more = false; //If there are still entities walking after the move
        for (var e in entities) {
            var entity = entities[e];
            if (entity.health <= 0) {
                entity.path = [];
                continue;
            }
            if (entity.path.length > 0) { //If the entity has a path
                if (entity.nextNode.x === entity.previousNode.x && entity.nextNode.y === entity.previousNode.y) {
                    entity.nextNode = entity.path.pop(); //The first node is the one we are on, so pop it
                    if (entity.path.length === 0) {
                        continue;
                    }
                }
                var dest = {
                    x: ~~(entity.path[entity.path.length - 1].x * 32),
                    y: ~~(entity.path[entity.path.length - 1].y * 32)
                };
                //entity.previousNode.x === entity.nextNode.x is so that we don't move from current to a node in the wrong direction, ie we don't actually want to go to nodes sometimes
                if ((Math.abs(dest.x - entity.x) <= howClose || entity.previousNode.x === entity.nextNode.x) && (Math.abs(dest.y - entity.y) <= howClose || entity.previousNode.y === entity.nextNode.y)) {
                    entity.previousNode = entity.nextNode;
                    entity.nextNode = entity.path.pop();
                    moveEntities.setChange(entity.id, 'previousNode', entity.previousNode);
                    moveEntities.setChange(entity.id, 'nextNode', entity.nextNode);
                    var dest = {
                        x: ~~(entity.nextNode.x * 32),
                        y: ~~(entity.nextNode.y * 32)
                    };
                }
                moveEntities.microMoveTowardPoint(entity, dest, moveEntities.microMove, howClose, (entity.previousNode.x === entity.nextNode.x), (entity.previousNode.y === entity.nextNode.y));
                more = true;
                if (!entity.walking) {
                    entity.walking = true;
                    moveEntities.setChange(entity.id, 'walking', true);
                }
            } //If the entity is not at the heading
            else if (Math.abs(entity.heading.x - entity.x) <= howClose && Math.abs(entity.heading.x - entity.y) <= howClose) {
                moveEntities.microMoveTowardPoint(entity, entity.heading, moveEntities.microMove, howClose);
                more = true;
                if (!entity.walking) {
                    entity.walking = true;
                    moveEntities.setChange(entity.id, 'walking', true);
                }
            } //Not walking
            else {
                if (entity.walking) {
                    entity.walking = false;
                    moveEntities.setChange(entity.id, 'walking', false);
                }
            }
        }
        return moveEntities.changes;
    },
    microMoveTowardPoint(entity, point, microMove, howClose, lockX, lockY) { //mutates entity
        if (!lockX) {
            if (entity.x > point.x + howClose) {
                entity.x -= microMove;
                this.setChange(entity.id, 'x', entity.x);
            } else if (entity.x < point.x - howClose) {
                entity.x += microMove;
                this.setChange(entity.id, 'x', entity.x);
            }
        }
        if (!lockY) {
            if (entity.y > point.y + howClose) {
                entity.y -= microMove;
                this.setChange(entity.id, 'y', entity.y);
            } else if (entity.y < point.y - howClose) {
                entity.y += microMove;
                this.setChange(entity.id, 'y', entity.y);
            }
        }
    }
}
exports.moveEntities = moveEntities;
