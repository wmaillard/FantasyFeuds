function drawCastleCircles(castles, ctx) {
    for (var i in castles) {
        //currently only works for two colors
        if (castles[i].color[0].percent !== 0) {
            ctx.save();
            var width = 1.5 / Math.cbrt(zoom);
            ctx.lineWidth = width;
            ctx.globalAlpha = .1; //opacity
            ctx.beginPath();
            ctx.ellipse((castles[i].x + backgroundOffset.x) * zoom, (castles[i].y + backgroundOffset.y) * zoom, (castleRadius / 2.5) * zoom, (castleRadius / 3) * zoom, 0, 0, Math.PI * 2 * castles[i].color[0].percent);
            ctx.strokeStyle = ctx.fillStyle = castles[i].color[0].color;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        if (castles[i].color[1].percent !== 0) {
            ctx.save();
            var width = 1.5 / Math.cbrt(zoom);
            ctx.lineWidth = width;
            ctx.globalAlpha = .1; //opacity
            ctx.beginPath();
            ctx.ellipse((castles[i].x + backgroundOffset.x) * zoom, (castles[i].y + backgroundOffset.y) * zoom, (castleRadius / 2.5) * zoom, (castleRadius / 3) * zoom, 0, -Math.PI * 2 * castles[i].color[1].percent, 0);
            ctx.strokeStyle = ctx.fillStyle = castles[i].color[1].color;
            ctx.fill()
            ctx.stroke();
            ctx.restore();
        }
    }
}

function drawEntityCircles(entities, ctx, playerTeam) {
    //Should add, if not in a castle's circle TODO
    var entityRadius = 250;
    for (var e in entities) {
        if (entities[e].health > 0 && entities[e].team === playerTeam && !entities[e].attacking) {
            ctx.save();
            var width = 1.5 / Math.cbrt(zoom);
            ctx.lineWidth = width;
            ctx.globalAlpha = .1; //opacity
            ctx.beginPath();
            ctx.ellipse((entities[e].x + backgroundOffset.x) * zoom, (entities[e].y + backgroundOffset.y) * zoom, (entityRadius / 2.5) * zoom, (entityRadius / 3) * zoom, 0, 0, Math.PI * 2);
            ctx.strokeStyle = ctx.fillStyle = entities[e].team;
            ctx.fill();
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
    var directionOptions = [
        'S',
        'W',
        'E',
        'N'
    ]
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (var e in entities) {
        var type = entities[e].type;
        if (!entities[e].id || !isInWindow(entities[e].x, entities[e].y, entityInfo[type].width, entityInfo[type].height)) {
            continue;
        }
        if (!entityInfo[type]) {
            return; //Takes care of race conditions when loading
        }
        if (entities[e].attacking && entities[e].walkingState === 2 && entities[e].health > 0) {
            entities[e].walkingState = 1;
        }
        var img_x = entities[e].walkingState * entityInfo[type].width;
        if (!entities[e].directionPointing) {
            if (entities[e].aiType === 'passive' || entities[e].dead) {
                entities[e].directionPointing = 'S';
            } else {
                entities[e].directionPointing = directionOptions[~~(Math.random() * 4)];
            }
        }
        var img_y = directions[entities[e].directionPointing] * entityInfo[type].height;
        var x, y, nodeX, nodeY;
        x = entities[e].x;
        y = entities[e].y;
        nodeX = ~~(x / size);
        nodeY = ~~(y / size);
        var whichImage = entities[e].type;
        if (entities[e].health <= 0 || entities[e].attacking) {
            whichImage += 'Pose';
        }
        if (entities[e].team === 'orange' || entities[e].team === 'blue') {
            whichImage += ('_' + entities[e].team)
        }
        cutOutCharacter(newCan, characterImages[whichImage], img_x, img_y, entityInfo[type].width, entityInfo[type].height, entities[e]);
        if (!entities[e].dead) {
            drawHealthBar(entities[e], newCan);
        }
        var entityCenter = {};
        var entitySize = entityInfo[type].size;
        entityCenter.x = entities[e].x - (newCan.width * entitySize - entityInfo[type].width * entitySize / 2);
        entityCenter.y = entities[e].y - (newCan.height * entitySize - entityInfo[type].height * entitySize); //unclear why this is no /2, has to do with canvas cutting
        var point = mapToScreenPoint(entityCenter.x, entityCenter.y);
        ctx.drawImage(newCan, point.x, point.y, newCan.width * entitySize * zoom, newCan.height * entitySize * zoom);
    }
    if (boughtEntity) {
        drawEntityCircles(entities, ctx, playerTeam);
    }
    drawCastleCircles(castles, ctx);
}

function cutOutCharacter(newCan, img, x, y, width, height, entity) {
    newCan.width = width;
    newCan.height = height * 2;
    var ctx = newCan.getContext('2d');
    if (selectedEntities[entity.id] && entity.health > 0) {
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
    ctx.fillStyle = entity.healthbarColor;
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
        if (entity.path.length < 3) {
            victim = entity.heading;
        } else {
            victim = {};
            var next = entity.path[2];
            if (entity.previousNode.x < next.x) { //1000000 is abitrary, just send it way out
                victim.x = entity.x + 1000000;
            } else if (entity.previousNode.x > next.x) {
                victim.x = entity.x - 1000000;
            } else {
                //victim.x = entity.heading.x;
                victim.x = 0;
            }
            if (entity.previousNode.y < next.y) {
                victim.y = entity.y + 1000000;
            } else if (entity.previousNode.y > next.y) {
                victim.y = entity.y - 1000000;
            } else {
                //victim.y = entity.heading.y;
                victim.y = 0;
            }
        }
    }
    setDirectionFacing(entity, victim);
}

function setDirectionFacing(entity, victim) {
    if (entity.dead) {
        return;
    }
    if (victim && (victim.x || victim.y)) {
        var angleDeg = Math.atan2(victim.y - entity.y, victim.x - entity.x) * 180 / Math.PI;
        if (angleDeg < 0) {
            angleDeg += 360;
        }
        if (angleDeg >= 45 && angleDeg < 135) {
            entity.directionPointing = 'S';
        } else if (angleDeg >= 135 && angleDeg < 225) {
            entity.directionPointing = 'W'
        } else if (angleDeg >= 225 && angleDeg < 315) {
            entity.directionPointing = 'N'
        } else {
            entity.directionPointing = 'E';
        }
    } else if (!entity.aiType && entity.directionPointing !== 'S' && !entity.dead) {
        entity.directionPointing = 'S';
    }
}
