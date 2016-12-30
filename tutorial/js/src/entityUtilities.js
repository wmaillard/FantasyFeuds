function entityIsSelected() {
    var selectedEntities = [];
    for (var i in entities) {
        if (entities[i].selected === true) {
            selectedEntities.push(entities[i])
        }
    }
    return selectedEntities;
}

function entityIsBlocked(x, y) {
    if (isBlocked(x, y) === true || isBlocked(x + 16, y) === true || isBlocked(x, y + 16) === true || isBlocked(x + 16, y + 16) === true) {
        return true;
    } else if (isBlocked(x, y) === undefined || isBlocked(x + 16, y) === undefined || isBlocked(x, y + 16) === undefined || isBlocked(x + 16, y + 16) === undefined) {
        return true;
    } else return false;
}

function onlyPlayerEntities(entities, playerId) {
    var playerEntities = [];
    for (var entity in entities) {
        if (entities[entity].playerId === playerId) {
            playerEntities.push(entities[entity]);
        }
    }
    return playerEntities.sort(compare);
}

function compare(a, b) {
    if (a.id < b.id) {
        return -1;
    }
    if (a.id > b.id) {
        return 1;
    }
    return 0;
}

function isBlocked(x, y) {
    if (!blockingTerrain[~~(x / 32)] || !blockingTerrain[~~(x / 32)][~~(y / 32)]) {
        return false;
    }
    return blockingTerrain[~~(x / 32)][~~(y / 32)];
}
