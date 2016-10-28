var Attacks = {
    entitiesMap: {},
    redisClient: require('redis').createClient(process.env.REDIS_URL),
    addAttacks(entities) {
        var attacks = [];
        for (var entity in entities) {
            var attack = Attacks.attackableEntities(entities[entity], entities);
            if (attack.length > 0 && attack.attacker && attack.attacker.length() > 0 && attack.victim && attack.victim.length() > 0) {
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
                this.redisClient.set('attacks', val);
                this.applyAttacks(attacks, entities);
            }
        });
    },
    clearAttacks(entities) {
        for (var e in entities) {
            entities[e].attacking = false; // clear attacks
        }
    },
    commitAttacks(entities) {
        this.clearAttacks(entities)
        this.doAttacks(entities); //has built in set redis for attacks
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
        if (entity.previousNode) {
            //if there is a previous node then we will delete it and add in the new one
            oldX = (entity.previousNode.x);
            oldY = (entity.previousNode.y);
            if (oldX !== newX || oldY !== newY) {
                Attacks.removeFromEntityMap(oldX, oldY, entity.id);
                if (!Attacks.entitiesMap[newX]) {
                    Attacks.entitiesMap[newX] = {};
                }
                if (!Attacks.entitiesMap[newX][newY]) {
                    Attacks.entitiesMap[newX][newY] = [];
                }
                Attacks.entitiesMap[newX][newY].push(entity.id);
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
            attacks.push(attack);
        }
        return attacks;
    },
    applyAttacks(attacks, allEntities) { //mutates allEntities ;()
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
                        setChange(k, 'victim', j);
                        allEntities[j].health -= entityInfo[allEntities[k].type].attack;
                        allEntities[j].health < 0 ? allEntities[j].health = 0 : null;
                        setChange(j, 'health', allEntities[j].health)
                    } else {
                        Attacks.removeFromEntityMap(allEntities[j].x, allEntities[j].y, allEntities[j].id)
                        allEntities[j].dead = true;
                        setChange(j, 'dead', true);
                        allEntities[j].walkingState = 2;
                        setChange(j, 'walkingState', 2);
                        playerInfo[attack.attacker.playerId].gold += entityInfo[allEntities[j].type].value;
                        playerInfoChange = true;
                    }
                    allEntities[k].attacking = attacking;
                }
            }
        }
    }
}
exports.Attacks = Attacks;
