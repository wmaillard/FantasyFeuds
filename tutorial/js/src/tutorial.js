var firstTime = {showShop : true, buyEntity : false, placeEntity : false, selectEntity : false, zoomToEntity : false, moveEntity : true, selectEntity: true, attackQuarry : true};
var circles = {quarry: false}
var locks ={move : false, shop : true}
var quarryCircleColor = 'pink';
var messageDone = false;
var messageTimeouts = [];
var entityId = 1;
var aiId = -1;
var showText = function(target, message, index, interval) {
    if (!interval) {
        interval = 40;
    }
    if (!index) {
        index = 0;
    }
    if (index < message.length && !messageDone) {
		var varInterval = interval;
		if(message[index] === ' '){
			varInterval *= 1.5;
		}
        $(target).append(message[index++]);
		var t = setTimeout(function() { showText(target, message, index, interval); }, varInterval);
        messageTimeouts.push(t);
    }else{
		messageDone = true;
	}
}


var clearPendingMessage = function(){
	var t;
	while(t = messageTimeouts.pop()){
			clearTimeout(t);
		}
	
}
var nextMessage = function(message){
		messageDone = true;
		clearPendingMessage();
		messageDone = false;
		$('.bubble').text('');
		showText('.bubble', message);
}
var message1 = 'Welcome to the Tutorial!  My name is Burk, and I will be your guide.  Please enter your name below and click "Start" after the page has finished loading...';
var message2 = function(name){ return 'Hi ' + name + ', welcome to the land of Fantasy Feuds!  This is a capture the flag game (think Call of Duty or Battlefield), in which you battle against other online players to conquer and hold the most castles...';}
var message3 = 'Start by buying a character from the store in the upper right corner.  You can only buy a character if you have enough coins.';
var message301 = 'If you ever get confused, just click the question mark on the left and I will come back and help you.';
var message4 = function(name){
	return 'OK ' + name + ', I have added you to the Blue team.  Your team owns the castle with the Blue circle around it.  You can now add your character by clicking or tapping on a spot within the Blue circle.';
}
var message5 = 'Great Job! You have added a character.  Now zoom in on your character by either pinching or scrolling. After you have zoomed in, select your character by tapping or clicking on it...';
var message6 = 'Great! Now that your character is selected, click or tap on the map to make your character walk to that spot...';
var message7 = 'Cool! Now look around, by dragging the map, to see if you can find the Quarry which is near the Path and is outlined with a Pink Circle.  Once you find it, make your character walk to anywhere within the Pink Circle.';
var message8 = 'Great! Now stay put and your character will automatically mine the Quarry until its healthbar is drained.';
var message9 = 'Awesome! You have killed your first AI character!  There are three types of AI, all of which have Black Healthbars.  Some will just lie there, some will flee, and some will fight back!...'
var message10 = 'Everytime you kill a character you will receive more coins which you can use to buy more characters.  You now have enough coins to buy another character, so do it...';
var message11 = 'You can add characters to castles OR next to any other character on your team.  Add your new character in the circle around your old character...';
var message12 = 'Great! Now make sure that both of your characters are visible, and click the character select button at the bottom to select both of them';
var message13 = 'Cool! Now you can move both characters at the same time!...';
var message14 = 'Look down the path to the Next Castle and make your characters walk within its Orange Circle.  Protip: If you lose your characters, you can click either of the Arrows in the bottom corners of the screen to quickly find them!';
var message15 = "Careful, you are behind enemy lines!  In order to conquer a castle, your team must have more characters in it than the enemy. Kill the two Blue Orcs in the castle so you can conquer it!";
var message16 = 'Congratulations!  You have defeated the Orange Team and completed the tutorial!  Click below to test your skills in a round of Fantasy Feuds!'
var message1501 = "Sweet! Your team owns more castles than the Orange Team.  Now hold those castles and the Orange Team's healthbar on the top of the screen will drain!";
messageDone = false;
nextMessage(message1);

function withinCircle(entity, pointEntity, radius) {
    if(!radius){
		radius = 150;
	}
    var rx = radius / 2.5;
    var ry = radius / 3;

            if (Math.pow((pointEntity.x - entity.x), 2) / Math.pow(rx, 2) + Math.pow((pointEntity.y - entity.y), 2) / Math.pow(ry, 2) < 1) {
                return true;
            }
        
    
    return false;
}

function drainHealth(attacker, victim, fightBack, callback){
	if(attacker.health > 0 && victim.health > 0){
		if(fightBack){
			victim.victim = attacker.id;
			victim.attacking = true;
			attacker.health -= 5;
		}
		attacker.victim = victim.id;
		attacker.walking = false;
		attacker.attacking = true;
		if(victim.health > 0){
			victim.health -= ~~(Math.random * 10) + 10;
			if(victim.health <= 0 ){
				victim.health = 0;
				victim.dead = true;
				redrawBackground();

				
				attacker.attacking = false;
				attacker.victim = null;
				attacker.walking = false;
				attacker.attacking = false;
				if(callback){
					callback();
				}
			}else{

					redrawBackground();
				
				setTimeout(function(){
					drainHealth(attacker, victim, fightBack, callback);
			}, 750);
			}
		}

	}
}



function drainCastle(castle, callback){
	if(castle.color[0].percent > 0){
		castle.color[0].percent -= .1;
		castle.color[1].percent += .1;
		if(castle.color[0].percent < 0){
			castle.color[0].percent = 0;
			castle.color[1].percent = 1;
			if(callback){
				callback();
			}
		}
		redrawBackground();
		setTimeout(function(){
			drainCastle(castle, callback);
		}, 500);
	}
		redrawBackground();

		
	
}

function drainTeam(callback){
	drawScoreBar(scores);
	if(scores.orange > 0){
		scores.orange -= 100;
		if(scores.orange <= 0){
			drawScoreBar(scores);
			scores.orange = 0;
				if(callback){
					callback();
				}
						
		}else{
			setTimeout(function(){
			drainTeam(callback)}, 500);
			
		}
		
		
	}


}
function drawQuarryCircle(entity){
		ctx = ctxB;
		multiplier = 3;
		var radius = 150;
		ctx.save();
		ctx.beginPath();
		ctx.ellipse((entity.x + backgroundOffset.x) * zoom, (entity.y + backgroundOffset.y) * zoom, zoom * radius / 2.5, zoom * radius / 3, 0, 0, Math.PI * 2);
		ctx.lineWidth = 5 * zoom;
		ctx.strokeStyle = quarryCircleColor;
		ctx.stroke();
		ctx.restore();

}
