var moveEntities = {  //Currently mutates entities
    microMove: 4, //How far each step for an entity is.  Could make entity specific
    changes: {},
    entities: {},
        init() {

            Array.prototype.peak = function() {
                if (this.length === 0) {
                    return undefined;
                }
                return this[this.length - 1];
            }
        },
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
            moveEntities.changes = [];
            moveEntities.entities = entities;
            //NextNode is actually the current node, but called nextNode because currentNode should be derived from x, y
            //Previous node is the previous node
            //These two are used for animation of direction facing
            var howClose = moveEntities.microMove + 1;
            var more = false; //If there are still entities walking after the move
            for (var e in entities) {
                var entity = entities[e];
                if (entity.path.length > 0) { //If the entity has a path
                    var dest = {
                        x: ~~(entity.path.peak().x * 32),
                        y: ~~(entity.path.peak().y * 32)
                    };
                    if (Math.abs(dest.x - entity.x) <= howClose && Math.abs(dest.y - entity.y) <= howClose) {
                        entity.previousNode = entity.nextNode;
                        entity.nextNode = entity.path.pop();
                        moveEntities.setChange(entity.id, 'previousNode', entity.previousNode);
                        moveEntities.setChange(entity.id, 'nextNode', entity.nextNode);
                        var dest = {
                            x: ~~(entity.nextNode.x * 32),
                            y: ~~(entity.nextNode.y * 32)
                        };
                    }
                    moveEntities.microMoveTowardPoint(entity, dest, moveEntities.microMove, howClose);
                    more = true;
                    if (!entity.walking) {
                        entity.walking = true;
                        moveEntities.setChange(entity.id, 'walking', true);
                    }
                } //If the entity is not at the heading
                else if (Math.abs(entity.heading.x - entity.x) <= howClose && Math.abs(entity.heading.x - entity.y) <= howClose) {
                    moveEntities.microMoveTowardPoint(entity, entity.heading, microMove, howClose);
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
        microMoveTowardPoint(entity, point, microMove, howClose) { //mutates entity
            if (entity.x > point.x + howClose) {
                entity.x -= microMove;
            } else if (entity.x < point.x - howClose) {
                entity.x += microMove;
            }
            if (entity.y > point.y + howClose) {
                entity.y -= microMove;
            } else if (entity.y < point.y - howClose) {
                entity.y += microMove;
            }
            this.setChange(entity.id, 'x', entity.x);
            this.setChange(entity.id, 'y', entity.y);
        }

}
exports.moveEntities = moveEntities;
