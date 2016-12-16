



function setUpSocketListeners() {
    socket = io();
    socket.on('playerInfo', function(data) {
        allPlayerInfo = data;
        playerGold = data[playerId].gold;
        $('#goldAmount').text(" " + data[playerId].gold);


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
    socket.on('newPlayer', function(players){
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
        for (var i in selectedEntities) {
            if (serverEntities[i].dead) {
                delete selectedEntities[i];
            }
        }
        entities = serverEntities;
    })
    socket.on('team', function(team){
        playerTeam = team;
        if(playerTeam === 'blue'){
             //cacheMapTiles()
             zoomPanTo(castles[1].x, castles[1].y, zoom, { x: false, y: false }, true)
             zoomToOne(castles[1].x, castles[1].y, .35);
            
        }else if(playerTeam === 'orange'){
            //cacheMapTiles(true);
            zoomPanTo(castles[4].x, castles[4].y, zoom, { x: false, y: false }, true)
            zoomToOne(castles[4].x, castles[4].y, .35);
        }
        $('.teamName').text(playerTeam.charAt(0).toUpperCase() + playerTeam.slice(1)).css({color: playerTeam});
        $('.teamColor').css({color: playerTeam});
        if($('#introTeamBox:visible').length === 0){
            $('#introTeamBox').fadeIn();
            setTimeout(function(){
                    $('#introTeamBox').fadeOut('slow');
                }, 1000)
            
        }
        redrawBackground();
    })
    socket.on('playerColor', function(data){
        playerColor = data;
        $('.icon-coins').css({color: playerColor});
    })
    socket.on('pathfindingFailed', function(data){
        if(playerId === entities[data].playerId){
            $('#pathfindingFailed').fadeIn('fast', function(){
                setTimeout(function(){$('#pathfindingFailed').fadeOut('slow')}, 1000);
            })
        }
    })
    socket.on('connect', function() {
        playerId = socket.id;
        socket.emit('name', name);
    })
    socket.on('scores', function(newScores){
        scores = newScores;
        window.requestAnimationFrame(function(){drawScoreBar(scores)});
    })
    socket.on('gameOver', function(data){
        $('#winningTeam').text(data.winner.charAt(0).toUpperCase() + data.winner.slice(1)).css({color: data.winner});
        $('#gameOverInfo').modal('show');
        $('#introTeamBox').show();
        entities = {};
        socket.disconnect();
        selectedEntities = {};
        setUpSocketListeners();
    })
    socket.on('addEntityFailure', function(data){

        boughtEntity = data.entity.type;
        $('#badSpot').fadeIn('fast', function(){
            setTimeout(function(){$('#badSpot').fadeOut('slow')}, 1000);
        })
    })
    socket.on('addEntitySuccess', function(data){

        entities[data.entity.id] = data.entity;
    })
}
