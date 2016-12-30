var moveEntities = { //Currently mutates entities
    microMove: 8, //How far each step for an entity is per tick.  Could make entity specific, should be relative to tickrate
    changes: {},
    entities: {},
    /*setChange(entityId, key, value) {
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
    },*/
    moveEntities(entities) { //This is global scope for some reason, maybe because it is called
       // moveEntities.changes = {};
	   var change = false;
        if (!moveEntities.microMove) {
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
            if (entity.health <= 0 || entity.playerId === -1) {
                entity.path = [];
                continue;
            }
            if (entity.path.length > 0) { //If the entity has a path
			change = true;
                var dest = {
                    x: ~~(entity.path[entity.path.length - 1].x * 32),
                    y: ~~(entity.path[entity.path.length - 1].y * 32)
                };
                //entity.previousNode.x === entity.nextNode.x is so that we don't move from current to a node in the wrong direction, ie we don't actually want to go to nodes sometimes
                if ((Math.abs(dest.x - entity.x) <= howClose || entity.previousNode.x === entity.nextNode.x) && (Math.abs(dest.y - entity.y) <= howClose || entity.previousNode.y === entity.nextNode.y)) {
                    entity.previousNode = entity.nextNode;
                    entity.nextNode = entity.path.pop();
                    //moveEntities.setChange(entity.id, 'previousNode', entity.previousNode);
                    //moveEntities.setChange(entity.id, 'nextNode', entity.nextNode);
                    var dest = {
                        x: ~~(entity.nextNode.x * 32),
                        y: ~~(entity.nextNode.y * 32)
                    };
                }
                moveEntities.microMoveTowardPoint(entity, dest, moveEntities.microMove, howClose, (entity.previousNode.x === entity.nextNode.x), (entity.previousNode.y === entity.nextNode.y));
                more = true;
                if (!entity.walking) {
                    entity.walking = true;
                   // moveEntities.setChange(entity.id, 'walking', true);
                }
            } //If the entity is not at the heading
            else if (entity.heading.x !== entity.x || entity.heading.y !== entity.y) { //Math.abs(entity.heading.x - entity.x) <= .001 && Math.abs(entity.heading.y - entity.y) <= .001) {
				change = true;
                var diffX = Math.abs(entity.heading.x - entity.x);
                var diffY = Math.abs(entity.heading.y - entity.y);
                //2nd half of logic is a workaround because entities are once in a while given a heading with no path, weird far away headings
                if ((diffX > 5 || diffY > 5) && (diffX < 32 * 2 && diffY < 32 * 2)) { // 32 * 2 is 2 tiles
                    moveEntities.microMoveTowardPoint(entity, entity.heading, 4, 5);
                } else if(diffX > 32 * 2 || diffY > 32 * 2){
                    //console.log('Path and heading mismatch: ', diffX, ' ', diffY);
					entity.heading.x = entity.x;
					entity.heading.y = entity.y;
				   //moveEntities.setChange(entity.id, 'heading', {x: entity.x, y: entity.y})

                }else {
					entity.x =  entity.heading.x;
					entity.y = entity.heading.y;
						if(firstTime.moveEntity){
							firstTime.moveEntity =  false;
							$('#tutorialModal').modal({
								backdrop: 'static',
								keyboard: false
							})
							nextMessage(message7);
							var newQuar = new Entity({x: 3050, y: 1600}, 100, 'quarry', -1, 'black', aiId);
							aiId--;
							newQuar.selected = true;
							entities[newQuar.id] = newQuar;

							
						}else if(firstTime.attackQuarry){
							if(withinCircle(entity, entities[-1])){
								quarryCircleColor = 'green';
								locks.move = true;
								firstTime.attackQuarry = false;
								$('#tutorialModal').modal({
									backdrop: 'static',
									keyboard: false
								})
								$('#tutorialModalButton').click(function(){
									$('#tutorialModal').modal('hide');
									drainHealth(entities[1], entities[-1], false, function(){
										playerGold += 40; 
										$('#goldAmount').text(' ' + playerGold);
										$('#tutorialModal').modal({
											backdrop: 'static',
											keyboard: false
										});
									
										$('#tutorialModalButton').text('More...').unbind( "click" ).click(function(){
											$('#tutorialModalButton').text('Try It!').click(function(){
												circles.quarry = false;
												redrawBackground();

												$('#showShop').addClass('breathing');
												firstTime.buy2 = true;
												$('#tutorialModal').modal('hide');
											})
											nextMessage(message10);
											return false;
										})
										nextMessage(message9);
									});
								});
								nextMessage(message8);
							}
						}else if(firstTime.goToOrange && withinCircle(entities[1], castles[1], castleRadius) && withinCircle(entities[2], castles[1], castleRadius)){
							$('#tutorialModal').modal({
								backdrop: 'static',
								keyboard: false
							});
							$('#tutorialModalButton').unbind('click').click(function(){
								$('#tutorialModal').modal('hide');
							});
							nextMessage(message15);
							entities[aiId] = new Entity({x : castles[1].x, y : castles[1].y + 120}, 100, 'orcPeon', -1, 'orange', aiId);
							entities[aiId].healthbarColor = '#FFA343'
							entities[aiId].walking = false;
							aiId--;
							entities[aiId] = new Entity({x : castles[1].x + 35, y : castles[1].y + 120}, 100, 'orcWarlord', -1, 'orange', aiId)
							entities[aiId].healthbarColor = '#FFA343'
							entities[aiId].walking = false;
							aiId--;
							redrawBackground();
							firstTime.goToOrange = false;
							firstTime.attackCastle = true;
						}
						else if(firstTime.attackCastle && withinCircle(entities[1], entities[-2])){
							locks.move = true;
							firstTime.attackCastel = false;
							drainHealth(entities[2], entities[-3], true, function(){
								drainCastle(castles[1], function(){
										drainTeam(function(){
											$('#tutorialModal').modal({
												backdrop: 'static',
												keyboard: false
											});
											nextMessage(message16);
											$('#tutorialModalButton').text('Play Now!').unbind( "click" ).click(function(){
												
												$('body').empty().append('<div class="row"><div class="col-xs-10 offset-xs-1"><div class="spinner"><div class="cube1"></div><div class="cube2"></div></div></div></div>')
												 window.location = 'http://fantasyfeuds.com';
											})
									});
									
								
							});
						});
						drainHealth(entities[1], entities[-2], true);
				}
				}
			
                more = true;
			if (!entity.walking) {
				entity.walking = true;
				//moveEntities.setChange(entity.id, 'walking', true);
			}
				}
             //Not walking
            else {
                if (entity.walking) {
					change = true;
                    entity.walking = false;
					

                    //moveEntities.setChange(entity.id, 'walking', false);
                }
            }
        }
        return change;
    },
    microMoveTowardPoint(entity, point, microMove, howClose, lockX, lockY) { //mutates entity
        if (!lockX) {
            if (entity.x > point.x + howClose) {
                entity.x -= microMove;
               // this.setChange(entity.id, 'x', entity.x);
            } else if (entity.x < point.x - howClose) {
                entity.x += microMove;
              //  this.setChange(entity.id, 'x', entity.x);
            }
        }
        if (!lockY) {
            if (entity.y > point.y + howClose) {
                entity.y -= microMove;
               // this.setChange(entity.id, 'y', entity.y);
            } else if (entity.y < point.y - howClose) {
                entity.y += microMove;
              //  this.setChange(entity.id, 'y', entity.y);
            }
        }
    }
}