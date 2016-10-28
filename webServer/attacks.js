var Attacks = {  //This mutates entities in setChange
    entitiesMap: {},
    redisClient: require('redis').createClient(process.env.REDIS_URL),
    LOO: require('./generalUtilities.js').LOO,
    changes: {},
    entityInfo : require('./entityInfo.js').entityInfo,
    playerMoneyChanges: [],

    setChange(entityId, key, value, entities) {
    if (key === 'wholeEntity') {
        entities[entityId] = value;
        this.changes[entityId] = value;
    } else {
        entities[entityId][key] = value;
        if (!this.changes[entityId]) {
            this.changes[entityId] = {};
        }
        this.changes[entityId][key] = value;
    }
},
    addAttacks(entities) {
        var attacks = [];
        for (var entity in entities) {
            var attack = Attacks.attackableEntities(entities[entity], entities);
            if (attack.length > 0) {
                attacks.push(attack);
            }
        }
        this.redisClient.set('attacks', JSON.stringify(attacks));
    },
    doAttacks(entities) {
        this.redisClient.get('attacks', function(err, attacks) {
            if (err) {
                console.err(err);
            }
            attacks = JSON.parse(attacks);
            if (attacks && attacks.length > 0) {
                var val = JSON.stringify([]);
                Attacks.redisClient.set('attacks', val);
                Attacks.applyAttacks(attacks, entities);
            }
        });
    },
    clearAttacks(entities) {
        for (var e in entities) {
            entities[e].attacking = false; // clear attacks
        }
    },
    commitAttacks(entities) {
        this.playerMoneyChanges = [];
        this.clearAttacks(entities)
        this.doAttacks(entities); //has built in set redis for attacks
        return {changes: this.changes, playerMoneyChanges: this.playerMoneyChanges};
    },
    removeFromEntityMap(x, y, id) {
        if (Attacks.entitiesMap[x] && Attacks.entitiesMap[x][y]) {
            for (var i in Attacks.entitiesMap[x][y]) {
                if (Attacks.entitiesMap[x][y][i] == id) {
                    Attacks.entitiesMap[x][y].splice(i, 1);
                }
            }
        }
    },
    setEntitiesMap(entity, newEntity) {
        var newX = ~~(entity.x / 32);
        var newY = ~~(entity.y / 32);
        var oldX = null;
        var oldY = null;
        if (entity.previousMapNode) {
            //if there is a previous node then we will delete it and add in the new one
            oldX = (entity.previousMapNode.x);
            oldY = (entity.previousMapNode.y);
            if (!(oldX === newX && oldY === newY)) {
                Attacks.removeFromEntityMap(oldX, oldY, entity.id);
                if (!Attacks.entitiesMap[newX]) {
                    Attacks.entitiesMap[newX] = {};
                }
                if (!Attacks.entitiesMap[newX][newY]) {
                    Attacks.entitiesMap[newX][newY] = [];
                }
                Attacks.entitiesMap[newX][newY].push(entity.id);
                entity.previousMapNode = {x : newX, y: newY}
                return true; //moved
            }
        } else if (newEntity) {
            if (!Attacks.entitiesMap[newX]) {
                Attacks.entitiesMap[newX] = {};
            }
            if (!Attacks.entitiesMap[newX][newY]) {
                Attacks.entitiesMap[newX][newY] = [];
            }
            Attacks.entitiesMap[newX][newY].push(entity.id);
            entity.previousMapNode = {x : newX, y: newY}
        }
    },
    attackableEntities(entity, entities) {
        var attacks = [];
        var nearbyEntities = [];
        if (entity.attackType === 'sword' && !entity.dead) {
            var nodeX = ~~(entity.x / 32);
            var nodeY = ~~(entity.y / 32);
            for (var i = nodeX - 1; i <= nodeX + 1; i++) {
                for (var j = nodeY - 1; j <= nodeY + 1; j++) {
                    if (!Attacks.entitiesMap[i] || !Attacks.entitiesMap[i][j]) {
                        continue;
                    }
                    if (Attacks.entitiesMap[i][j].length > 0) {
                        var entitiesAtNode = Attacks.entitiesMap[i][j];
                        if (entitiesAtNode.length > 0) {
                            for (var e in entitiesAtNode) {
                                var charact = entities[entitiesAtNode[e]];
                                if (charact && !charact.dead && charact.playerId !== entity.playerId) { //don't attack yourself, could use this logic to heal
                                    nearbyEntities.push(entities[entitiesAtNode[e]]);
                                }
                            }
                        }
                    }
                }
            }
        }
        for (var i in nearbyEntities) {
            var victim = nearbyEntities[i];
            var attack = {
                attacker: { id: entity.id, playerId: entity.playerId },
                victim: { id: victim.id, playerId: victim.playerId },
                power: 1 / nearbyEntities.length
            };
            if(attack.attacker.id && attack.victim.id){
                attacks.push(attack);
            }
        }
        return attacks;
    },
    applyAttacks(attacks, allEntities) { //mutates allEntities ;()
        this.changes = {};
        var attackList;
        while (attackList = attacks.shift()) {
            for (var a in attackList) {
                var attack = attackList[a];
                var j = attack.victim.id;
                var k = attack.attacker.id;
                var attacking = false;
                if (allEntities[j] && allEntities[k]) {
                    if (allEntities[j].health > 0) {
                        attacking = true;
                        allEntities[k].victim = j;
                        Attacks.setChange(k, 'victim', j, allEntities);
                        allEntities[j].health -= Attacks.entityInfo[allEntities[k].type].attack * attack.power;
                        allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
                        Attacks.setChange(j, 'health', allEntities[j].health, allEntities)
                    } else {
                        Attacks.removeFromEntityMap(allEntities[j].x, allEntities[j].y, allEntities[j].id, allEntities)
                        allEntities[j].dead = true;
                        Attacks.setChange(j, 'dead', true, allEntities);
                        allEntities[j].walkingState = 2;
                        Attacks.setChange(j, 'walkingState', 2, allEntities);
                        this.playerMoneyChanges.push({id: attack.attacker.playerId, gold : Attacks.entityInfo[allEntities[j].type].value});
                    }
                    allEntities[k].attacking = attacking;
                }
            }
        }
    }
}
exports.Attacks = Attacks;
