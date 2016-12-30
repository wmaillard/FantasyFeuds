function mapMove(e) {
    if (e.type === 'panstart') {
        currentCoords.x = e.pointers[0].clientX;
        currentCoords.y = e.pointers[0].clientY;
        $('#gameContainer').css('cursor', 'move');
    } else if (e.type === 'panend') {
        $('#gameContainer').css('cursor', 'default');
    };
    var changeX = Math.abs(e.pointers[0].clientX - currentCoords.x);
    var changeY = Math.abs(e.pointers[0].clientY - currentCoords.y);
    backgroundOffset.x += (e.pointers[0].clientX - currentCoords.x) / zoom;
    backgroundOffset.y += (e.pointers[0].clientY - currentCoords.y) / zoom;
    limitBackgroundOffset();
    currentCoords.x = e.pointers[0].clientX;
    currentCoords.y = e.pointers[0].clientY;
}

function clickGameContainer(e) {
    var point = convertScreenToMapPoint(e.pointers[0].clientX, e.pointers[0].clientY, zoom)
    var entityAtClick = entityIsThere(point.x, point.y);
    if (entityAtClick && !entityAtClick.dead && entityAtClick.playerId === playerId) {
		if(firstTime.selectEntity){
			$('#tutorialModal').modal({
				backdrop: 'static',
				keyboard: false
			})
			firstTime.selectEntity = false;
			circles.quarry = true;
			nextMessage(message6);
		}
        deselectAllEntities();
        selectedEntities[entityAtClick.id] = entityAtClick;
        if (!$('#allEntities').hasClass('buttonDown')) {
            $('#allEntities').toggleClass('buttonDown')
        }
        redrawBackground();
    } else if (boughtEntity && playerTeam && !entityIsBlocked(point.x, point.y) && (firstTime.placeEntity && withinCircle(point, {x: castles[0].x, y: castles[0].y}, castleRadius) || firstTime.placeEntity2 && withinCircle(point, entities[1], 250))) {
        if (firstTime.placeEntity) {
			/*Make sure that entities are redrawn when they move*/
			setInterval(function(){
				if(moveEntities.moveEntities(entities)){
					redrawBackground()
				};
					}, 50)
					
			$('#tutorialModal').modal({
				backdrop: 'static',
				keyboard: false
			})
			nextMessage(message5);
            firstTime.placeEntity = false;
            firstTime.zoomToEntity = true;
        }else if(firstTime.placeEntity2){
			$('#tutorialModal').modal({
				backdrop: 'static',
				keyboard: false
			});
			$('#allEntities').addClass('breathing');
			firstTime.allEntities = true;
			selectedEntities = {};
			$('#allEntities').toggleClass('buttonDown');
			nextMessage(message12);
			firstTime.placeEntity2 = false;

		}
        var entity;
        var health = 100;
        entity = new Entity({
            'x': point.x,
            'y': point.y
        }, health, boughtEntity, playerId, playerTeam, entityId);
		entityId++;
        entity.healthbarColor = playerColor;
        entities[entity.id] = entity;
        playerGold -= entityInfo[boughtEntity].cost; 
		$('#goldAmount').text(' ' + playerGold);
        boughtEntity = false;
        redrawBackground();
    } else if (!entityIsBlocked(point.x, point.y) && !locks.move) {
        /*if (firstTime.moveEntity) {
            $('#tutorialMove').fadeOut('slow')
            firstTime.moveEntity = false;
        }*/
        setTimeout(function() { $('#blockedSpot').fadeOut('slow') }, 1000);
        var numMoving = LOO(selectedEntities);
        if (numMoving > 0) {
            for (var i in selectedEntities) {
                var entity = selectedEntities[i];
                if (entity.health > 0) {
                    entity.walking = true;
                    entity.heading = {};
                    if (numMoving > 1) {
                        entity.heading.x = ~~((point.x - 1) / 32) * 32 + 2 * Math.random() * 32;
                        entity.heading.y = ~~((point.y - 1) / 32) * 32 + 2 * Math.random() * 32;
                    } else {
                        entity.heading.x = point.x
                        entity.heading.y = point.y;
                    }
                    var coords = {
                        startX: entity.x,
                        startY: entity.y,
                        endX: entity.heading.x,
                        endY: entity.heading.y,
                        id: entity.id
                    }
                    //socket.emit('entityPathRequest', coords);
				entity.path = AI.AStar({x : ~~(coords.startX / 32), y : ~~(coords.startY / 32)}, {x : ~~(coords.endX / 32), y : ~~(coords.endY / 32)}, blockingTerrain, 500);
					
                }
            }
        }
    } else if(!locks.move){
        if (boughtEntity || LOO(selectedEntities) > 0) {
            $('#blockedSpot').fadeIn('fast', function() {
                setTimeout(function() { $('#blockedSpot').fadeOut('slow') }, 1000);
            })
        }
        $('#gameContainer').css('cursor', 'not-allowed');
        if (navigator.vibrate) {
            navigator.vibrate(125);
        }
        setTimeout(function() { $('#gameContainer').css('cursor', 'default'); }, 400);
    }
}

function deselectAllEntities() {
    selectedEntities = {};
}

function selectAllVisiblePlayerEntities(entities, playerId) {
    var playersEntities = onlyPlayerEntities(entities, playerId);
    for (e in playersEntities) {
        if (isInWindow(playersEntities[e].x, playersEntities[e].y) && !playersEntities[e].dead) {
            selectedEntities[playersEntities[e].id] = playersEntities[e];
        }
    }
}

function zoomPanTo(x, y, localZoom, limits, skipZoom) { //x, y is mapX, mapY
    if (typeof limits === 'undefined') {
        limits = { x: false, y: false }
    }
    var point = mapToScreenPoint(x, y, localZoom);
    var midPoint = { x: canvasWidth / 2, y: canvasHeight / 2 };
    var diffX = Math.abs(midPoint.x - point.x);
    var diffY = Math.abs(midPoint.y - point.y);
    var diffRangeX = 100;
    var diffChangeX = 50;
    var diffRangeY = 100;
    var diffChangeY = 50;
    var stuck = true;
    var endRange = 5 / (zoom);
    while (diffX < diffRangeX && diffX > endRange) {
        diffRangeX /= 2;
        diffChangeX /= 2;
    }
    while (diffY < diffRangeY && diffY > endRange) {
        diffRangeY /= 2;
        diffChangeY /= 2;
    }
    if (!limits.x && (diffX > endRange || point.x < 0)) {
        stuck = false;
        if (midPoint.x > point.x) {
            backgroundOffset.x += diffChangeX;
        } else {
            backgroundOffset.x -= diffChangeX;
        }
    }
    if (!limits.y && (diffY > endRange || point.y < 0)) {
        stuck = false;
        if (midPoint.y > point.y) {
            backgroundOffset.y += diffChangeY;
        } else {
            backgroundOffset.y -= diffChangeY;
        }
    }
    redrawBackground();
    var oldPoint = point;
    point = mapToScreenPoint(x, y, zoom);
    midPoint = { x: canvasWidth / 2, y: canvasHeight / 2 }; //This is reset on canvas reset.
    diffX = Math.abs(midPoint.x - point.x);
    diffY = Math.abs(midPoint.y - point.y);
    var newLimits = limitBackgroundOffset();
    if (newLimits.x === true) {
        limits.x = true;
    }
    if (newLimits.y === true) {
        limits.y = true;
    }
    if (!stuck && !(limits.x && limits.y) && (diffX > endRange || diffY > endRange || point.x < 0 || point.y < 0)) {
        if (!zoomPanTimeoutRunning) {
            zoomPanTimeoutRunning = true;
            setTimeout(function() {
                zoomPanTimeoutRunning = false;
                zoomPanTo(x, y, zoom, limits, skipZoom)
            }, 1000 / 30);
        }
    } else if (zoom < 1) {
        if (!zoomPanTimeoutRunning) {
            zoomPanTimeoutRunning = true;
            setTimeout(function() {
                zoomPanTimeoutRunning = false;
                if(skipZoom){
                    return;
                }
                zoomToOne(x, y);
            })
        }
    }
    if (!isInWindow(x, y)) {
        if (!zoomPanTimeoutRunning) {
            zoomPanTimeoutRunning = true;
            setTimeout(function() {
                zoomPanTimeoutRunning = false;
                if(skipZoom){
                    console.log('skipped')
                    return;
                }
                zoomPanTo(x, y, zoom)
            }, 1000 / 30);
        }
    } else {
        zoomPanCompletelyDone = true;
    }
}

function zoomToOne(x, y, finalZoom) {
    var scale = 2;
    if (!finalZoom) {
        if (zoom < 1) {
            finalZoom = 1;
        } else {
            finalZoom = zoomOutLimit;
        }
    }
    if (finalZoom < 1) {
        scale = .5;
    }
    var point = mapToScreenPoint(x, y);
    zoomAction({ scale: scale, center: point });
    if (scale > 1) { //Zooming out
        if (zoom < 1) {
            setTimeout(function() {
                zoomToOne(x, y, finalZoom);
            }, 1000 / 30)
        }
    } else { //Zooming in
        if (zoom > zoomOutLimit) {
            setTimeout(function() {
                zoomToOne(x, y, finalZoom);
            }, 1000 / 30)
        }
    }
}

function goToNextEntity() {
    if (!zoomPanCompletelyDone) {
        return;
    }
    var playerEntities = onlyPlayerEntities(entities, playerId);
    var index = -1;
    for (var i in playerEntities) {
        if (playerEntities[i].id === currentEntity) {
            index = i;
            break;
        }
    }
    if (index === -1) {
        if (playerEntities.length === 0) {
            return -1;
        } else index = 0;
    }
    index++;
    if (index === playerEntities.length) {
        index = 0;
    }
    var nextEntity = playerEntities[index];
    currentEntity = nextEntity.id;
    zoomPanCompletelyDone = false;
    zoomPanTo(nextEntity.x, nextEntity.y, zoom);
}

function goToPreviousEntity() {
    if (!zoomPanCompletelyDone) {
        return;
    }
    var playerEntities = onlyPlayerEntities(entities, playerId);
    var index = -1;
    for (var i in playerEntities) {
        if (playerEntities[i].id === currentEntity) {
            index = i;
            break;
        }
    }
    if (index === -1) {
        if (playerEntities.length === 0) {
            return -1;
        } else index = 0;
    }
    index--;
    if (index < 0) {
        index = playerEntities.length - 1;
    }
    var nextEntity = playerEntities[index];
    currentEntity = nextEntity.id;
    zoomPanCompletelyDone = false;
    zoomPanTo(nextEntity.x, nextEntity.y, zoom);
}

function slideMap(slope) {
    if (slope > 0) {
        backgroundOffset.x += 10;
        backgroundOffset.y = backgroundOffset.x * slope + backgroundOffset.x;
    } else {
        backgroundOffset.x -= 10;
        backgroundOffset.y = backgroundOffset.x * slope + backgroundOffset.x;
    }
    redrawBackground();
}

function createVector(panTime, oldCoords, newCoords) {
    var swipeRatio = 0.9;
    var length = Math.sqrt(Math.pow(oldCoords.x - newCoords.x, 2) + Math.pow(oldCoords.y - newCoords.y, 2));
    if (length / panTime > swipeRatio) {
        alert('Swipe! length: ' + length + ' time: ' + panTime + 'ms')
    }
}
