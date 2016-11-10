var Attacks = {  //This mutates entities in setChange
    entitiesMap: {},
    redisClient: require('redis').createClient(process.env.REDIS_URL),
    LOO: require('./generalUtilities.js').LOO,
    changes: {},
    entityInfo : require('./entityInfo.js').entityInfo,
    playerMoneyChanges: [],

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
    addAttacks(entities) {
        this.attacks = [];
        for (var entity in entities) {
            var attack = Attacks.attackableEntities(entities[entity], entities);
            if (attack.length > 0) {
                this.attacks.push(attack);
            }
        }

    },
    doAttacks(entities) {
            if (this.attacks && this.attacks.length > 0) {
                var val = JSON.stringify([]);
                Attacks.applyAttacks(this.attacks, entities);
            }

    },
    clearAttacks(entities) {
        for (var e in entities) {
            if(entities[e].attacking){
                Attacks.setChange(e, 'attacking', false, entities);
            }
        }
    },
    commitAttacks(entities) {

        this.changes = {};
        this.playerMoneyChanges = [];
        this.AIAttacked = {};
        Attacks.addAttacks(entities);
        this.clearAttacks(entities);
        this.doAttacks(entities); //has built in set redis for attacks
        return {changes: this.changes, playerMoneyChanges: this.playerMoneyChanges, AIAttacked: this.AIAttacked};
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
                                if (charact && charact.team !== entity.team) { //don't attack yourself, could use this logic to heal
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
        var data = {};
        var attackList;
        while (attackList = attacks.shift()) {
            for (var a in attackList) {
                var attack = attackList[a];
                var j = attack.victim.id;
                var k = attack.attacker.id;

                if (allEntities[j] && allEntities[k]) {
                    if (allEntities[j].health > 0) {
                        if(allEntities[j].team === 'AI'){
                            this.AIAttacked[j] = allEntities[j];
                        }
                        Attacks.setChange(k, 'attacking', true, allEntities);
                        Attacks.setChange(k, 'victim', j, allEntities);
                        var health = allEntities[j].health - Attacks.entityInfo[allEntities[k].type].attack * attack.power * Math.random();
                        if(health <= 0){
                            health = 0;
                            Attacks.removeFromEntityMap(allEntities[j].x, allEntities[j].y, allEntities[j].id, allEntities)
                            Attacks.setChange(j, 'dead', true, allEntities);
                            Attacks.setChange(j, 'walkingState', 2, allEntities);
                            Attacks.playerMoneyChanges.push({id: attack.attacker.playerId, gold : Attacks.entityInfo[allEntities[j].type].value});

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
