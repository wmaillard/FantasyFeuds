function setUpSocketListeners() {
    socket = io();
    socket.on('playerInfo', function(data) {
        playerGold = data[playerId].gold;
        $('#playerGold span').text(" " + data[playerId].gold)
    });
    socket.on('changes', function(changes) {
        for (var i in changes) {
            if (entities[i]) {
                for (var j in changes[i]) {
                    entities[i][j] = changes[i][j]
                }
            } else {
                entities[i] = changes[i];
            }
        }
    })
    socket.on('castleColors', function(colors) {
        for (var c in colors) {
            if (castles[c]) {
                castles[c].color = colors[c];
            }
        }
    })
    socket.on('allEntities', function(serverEntities) {
        serverSentFullState = true;
        var selected = entityIsSelected();
        for (var i in selected) {
            if (!serverEntities[selected[i].id].dead) {
                serverEntities[selected[i].id].selected = true;
            }
        }
        entities = serverEntities;
    })
    socket.on('team', function(team){
        playerTeam = team;
        if(playerTeam === "blue"){ 
             backgroundOffset = {x: -781, y: -91};
             zoom = 0.3;
        }else if(playerTeam === "orange"){
            backgroundOffset = {x: -17615, y: -30061};
            zoom = 0.3
        }
        $('#introTeam').text(playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)).css({color: playerTeam});
        redrawBackground();
    })
    socket.on('connect', function() {
        playerId = socket.id;
    })
    socket.on('scores', function(newScores){
        scores = newScores;
        window.requestAnimationFrame(function(){drawScoreBar(scores)});
    })
    socket.on('gameOver', function(data){
        $('#gameOver').modal('show');
        entities = {};
    })
}
