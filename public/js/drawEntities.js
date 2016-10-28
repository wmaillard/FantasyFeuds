function drawCastleCircles(castles, ctx) {
    for (var i in castles) {
        //currently only works for two colors
        if (castles[i].color[0].percent !== 0) {
            ctx.save();
            ctx.lineWidth = 12 * zoom;
            ctx.globalAlpha = .6; //opacity
            ctx.beginPath();
            ctx.ellipse((castles[i].x + backgroundOffset.x) * zoom, (castles[i].y + backgroundOffset.y) * zoom, (castleRadius / 2.5) * zoom, (castleRadius / 3) * zoom, 0, 0, Math.PI * 2 * castles[i].color[0].percent);
            ctx.strokeStyle = castles[i].color[0].color;
            ctx.stroke();
            ctx.restore();
        }
        if (castles[i].color[1].percent !== 0) {
            ctx.save();
            ctx.lineWidth = 12 * zoom;
            ctx.globalAlpha = .6; //opacity
            ctx.beginPath();
            ctx.ellipse((castles[i].x + backgroundOffset.x) * zoom, (castles[i].y + backgroundOffset.y) * zoom, (castleRadius / 2.5) * zoom, (castleRadius / 3) * zoom, 0, -Math.PI * 2 * castles[i].color[1].percent, 0);
            ctx.strokeStyle = castles[i].color[1].color;
            ctx.stroke();
            ctx.restore();
        }
    }
}

function drawEntities(entities, ctx, lock, clear) {
    var directions = {
        'S': 0,
        'W': 1,
        'E': 2,
        'N': 3
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var entity in entities) {
        if (!isInWindow(entities[entity].x, entities[entity].y)) {
            continue;
        }
        var type = entities[entity].type;
        if (!entityInfo[type]) {
            return; //Takes care of race conditions when loading
        }
        var img_x = entities[entity].walkingState * entityInfo[type].width;
        var img_y = directions[entities[entity].directionPointing] * entityInfo[type].height;
        var x, y, nodeX, nodeY;
        x = entities[entity].x;
        y = entities[entity].y;
        nodeX = ~~(x / size);
        nodeY = ~~(y / size);
        var whichImage = entities[entity].type;
        if (entities[entity].dead || entities[entity].attacking) {
            whichImage += 'Pose';
        }
        if (entities[entity].team === 'orange' || entities[entity].team === 'blue') {
            whichImage += ('_' + entities[entity].team)
        }
        cutOutCharacter(newCan, characterImages[whichImage], img_x, img_y, entityInfo[type].width, entityInfo[type].height, entities[entity]);
        if (!entities[entity].dead) {
            drawHealthBar(entities[entity], newCan);
        }
        ctx.drawSafeImage(newCan, 0, 0, newCan.width, newCan.height, x * zoom + backgroundOffset.x * zoom - size * zoom, y * zoom + backgroundOffset.y * zoom - size * zoom, newCan.width * entitySize * zoom, newCan.height * entitySize * zoom);
    }
    drawCastleCircles(castles, ctx);
}

function cutOutCharacter(newCan, img, x, y, width, height, entity) {
    newCan.width = width;
    newCan.height = height * 2;
    var ctx = newCan.getContext('2d');
    if (selectedEntities[entity.id]) {
        drawHighlight(entity, newCan);
    }
    ctx.drawImage(img, x, y, width, height, 0, height * .5, width, height);
    return newCan;
}

function scaleDown(justCharacter, height, width) {
    var scalingCanvas = document.createElement('canvas');
    var oldHeight, oldWidth;
    oldHeight = justCharacter.height;
    oldWidth = justCharacter.width;
    scalingCanvas.width = oldWidth;
    scalingCanvas.height = oldHeight;
    var ctx = scalingCanvas.getContext('2d');
    ctx.drawImage(justCharacter, 0, 0, oldWidth, oldHeight);
    while (oldWidth > width * 2 && oldHeight > height * 2) {
        oldWidth /= 2;
        oldHeight /= 2;
        ctx.drawSafeImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, oldWidth / 2, oldHeight / 2);
    }
    justCharacter.height = height;
    justCharacter.width = width;
    var finalCtx = justCharacter.getContext('2d');
    finalCtx.clearRect(0, 0, justCharacter.width, justCharacter.height);
    finalCtx.drawSafeImage(scalingCanvas, 0, 0, oldWidth, oldHeight, 0, 0, width, height);
}

function drawHighlight(entity, canvas) {
    var ctx = canvas.getContext('2d');
    ctx.save(); 
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height * 2 / 3, canvas.width / 2.5, canvas.width / 3, 0, 0, Math.PI * 2);
    ctx.lineWidth = 5 * zoom;
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.restore();
}

function drawHealthBar(entity, canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = entity.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height / 15);
    ctx.fillStyle = "red";
    var health = 100 - entity.health;
    ctx.fillRect((1 - health / 100) * canvas.width, 0, (health / 100) * canvas.width, canvas.height / 15);
}

function animateEntity(entity, entities) {
    if (!entity.dead && !entity.walking && !entity.attacking && entity.type !== 'quarry') {
        if (entity.walkingState !== 1) {
            entity.walkingState = 1;
        }
    } else if (entity.dead) {
        entity.walkingState = 2;
    } else if (entity.attacking) {
        entity.walkingState === 0 ? entity.walkingState = 1 : entity.walkingState = 0;
    } else if (entity.walking || entity.type === 'quarry') {
        entity.walkingState === 0 ? entity.walkingState = 2 : entity.walkingState = 0;
    }
    var victim = null;
    if (entity.attacking) {
        victim = {};
        victim.x = entities[entity.victim].x;
        victim.y = entities[entity.victim].y;
    } else if (entity.walking) {
        victim = {};
        if(entity.previousNode.x < entity.nextNode.x){ //100 is abitrary, just send it way out
            victim.x = entity.x + 100;
        }else if(entity.previousNode.x > entity.nextNode.x){
           victim.x = entity.x - 100;
        }
        else{
            victim.x = entity.heading.x;
        }
        if(entity.previousNode.y < entity.nextNode.y){
            victim.y = entity.y + 100;
        }else if(entity.previousNode.x > entity.nextNode.x){
           victim.y = entity.y - 100;
        
        }else{
            victim.y = entity.heading.y;
        }
    }
    setDirectionFacing(entity, victim);
}

function setDirectionFacing(entity, victim) {
    if (entity.dead) {
        return;
    }
    if (victim) {
        var angleDeg = Math.atan2(victim.y - entity.y, victim.x - entity.x) * 180 / Math.PI;
        angleDeg = Math.abs(angleDeg);
        if (angleDeg >= 45 && angleDeg < 135) {
            entity.directionPointing = 'N';
        } else if (angleDeg >= 135 && angleDeg < 225) {
            entity.directionPointing = 'W'
        } else if (angleDeg >= 225 && angleDeg < 315) {
            entity.directionPointing = 'S'
        } else {
            entity.directionPointing = 'E';
        }
    } else if (entity.directionPointing !== 'S' && !entity.dead) {
        entity.directionPointing = 'S';
    }
}
