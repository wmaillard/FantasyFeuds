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
