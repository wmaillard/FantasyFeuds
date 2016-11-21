var Attacks = { //This mutates entities in setChange
    entitiesMap: {},
    LOO: require('./generalUtilities.js').LOO,
    changes: {},
    entityInfo: require('./entityInfo.js').entityInfo,
    playerMoneyChanges: [],
    movedNonAI: {},
    setChange(entityId, key, value, entities) {
        if (key === 'wholeEntity') {
            //entities[entityId] = value;
            this.changes[entityId] = value;
        } else {
            //entities[entityId][key] = value;
            if (!this.changes[entityId]) {
                this.changes[entityId] = {};
            }
            this.changes[entityId][key] = value;
        }
    },
    addAttacks(entities, allEntities) {
        this.attacks = [];
        for (var entity in entities) {
            var attack = Attacks.attackableEntities(entities[entity], entities, allEntities);
            if (attack.length > 0) {
                this.attacks.push(attack);
            }
        }
    },
    doAttacks(allEntities) {
        if (this.attacks && this.attacks.length > 0) {
            var val = JSON.stringify([]);
            Attacks.applyAttacks(this.attacks, allEntities);
        }
    },
    clearAttacks(entities) {
        for (var e in entities) {
            if (entities[e].attacking) {
                Attacks.setChange(e, 'attacking', false, entities);
            }
        }
    },
    commitAttacks(entities, allEntities) {
        this.changes = {};
        this.playerMoneyChanges = [];
        this.AIAttacked = {};
        Attacks.addAttacks(entities, allEntities);
        this.clearAttacks(entities);
        this.doAttacks(allEntities); 
        return { changes: this.changes, playerMoneyChanges: this.playerMoneyChanges, AIAttacked: this.AIAttacked };
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
                if (!entity.aiType) {
                    Attacks.movedNonAI[entity.id] = entity;
                }
                Attacks.removeFromEntityMap(oldX, oldY, entity.id);
                if (!Attacks.entitiesMap[newX]) {
                    Attacks.entitiesMap[newX] = {};
                }
                if (!Attacks.entitiesMap[newX][newY]) {
                    Attacks.entitiesMap[newX][newY] = [];
                }
                Attacks.entitiesMap[newX][newY].push(entity.id);
                entity.previousMapNode = { x: newX, y: newY }
                return true; //moved
            }
        } else if (newEntity) {
            if (!entity.aiType) {
                Attacks.movedNonAI[entity.id] = entity;
            }
            if (!Attacks.entitiesMap[newX]) {
                Attacks.entitiesMap[newX] = {};
            }
            if (!Attacks.entitiesMap[newX][newY]) {
                Attacks.entitiesMap[newX][newY] = [];
            }
            Attacks.entitiesMap[newX][newY].push(entity.id);
            entity.previousMapNode = { x: newX, y: newY }
        }
    },
    attackableEntities(entity, entities, allEntities) {
        var attacks = [];
        var nearbyEntities = [];
        if (entity.attackType === 'sword' && !entity.dead) {
            var nodeX = ~~(entity.x / 32);
            var nodeY = ~~(entity.y / 32);
            for (var i = nodeX - 2; i <= nodeX + 2; i++) {
                for (var j = nodeY - 2; j <= nodeY + 2; j++) {
                    if (!Attacks.entitiesMap[i] || !Attacks.entitiesMap[i][j]) {
                        continue;
                    }
                    if (Attacks.entitiesMap[i][j].length > 0) {
                        var entitiesAtNode = Attacks.entitiesMap[i][j];
                        if (entitiesAtNode.length > 0) {
                            for (var e in entitiesAtNode) {
                                var charact = allEntities[entitiesAtNode[e]];
                                if (charact && charact.team !== entity.team) { //don't attack yourself, could use this logic to heal
                                    nearbyEntities.push(allEntities[entitiesAtNode[e]]);
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
            if (attack.attacker.id && attack.victim.id) {
                attacks.push(attack);
            }
        }
        return attacks;
    },
    applyAttacks(attacks, allEntities) { //mutates allEntities ;()
        var data = {};
        var attackList;
        while (attackList = attacks.shift()) {
            for (var a in attackList) {
                var attack = attackList[a];
                var j = attack.victim.id;
                var k = attack.attacker.id;
                if (allEntities[j] && allEntities[k]) {
                    if (allEntities[j].health > 0) {
                        Attacks.setChange(k, 'attacking', true, allEntities);
                        Attacks.setChange(k, 'victim', j, allEntities);
                        var aiExtra = 1;
                        if(allEntities[j].aiType){
                            aiExtra = 2;
                        }

                        var health = allEntities[j].health - aiExtra * (Attacks.entityInfo[allEntities[k].type].attack * attack.power * (Math.random() / 2 + .5)) * (10 - Attacks.entityInfo[allEntities[j].type].defense) / 10;
                        if (health <= 0) {
                            allEntities[j].health = 0;
                            Attacks.removeFromEntityMap(allEntities[j].x, allEntities[j].y, allEntities[j].id, allEntities)
                            Attacks.setChange(j, 'dead', true, allEntities);
                            Attacks.setChange(j, 'walkingState', 2, allEntities);
                            var kill, aiKill;
                            kill = aiKill = 0;
                            if(allEntities[j].aiType){
                                aiKill = 1;
                            }else{
                                kill = 1;
                            }
                            Attacks.playerMoneyChanges.push({ id: attack.attacker.playerId, gold: Attacks.entityInfo[allEntities[j].type].value, kill : kill, aiKill : aiKill, victimPlayerId : attack.victim.playerId});
                        } else if (allEntities[j].team === 'ai' && allEntities[j].heading.x === allEntities[j].x && allEntities[j].heading.y === allEntities[j].y) { //don't alert if already moving
                            if(allEntities[j].aiType !== 'aggressive' || allEntities[j].health >= 25){
                                this.AIAttacked[j] = allEntities[j];
                            }
                            
                        }
                        Attacks.setChange(j, 'health', health, allEntities);
                    }
                }
            }
        }
        return data;
    }
}
exports.Attacks = Attacks;
