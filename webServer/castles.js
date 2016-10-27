var castles = {
    castles: require('./castlesData.js').castles,
    playerCastles: {},
    castleRadius: 2500,
    teams: ['orange', 'blue'],
    percentPerEntity: 0.05,
    attackCastle: function(castle) {
        var teams = this.teams;
        var LOO = require('./generalUtilities').LOO;
        var moreOrange = LOO(castle.entities.teams['orange']) - LOO(castle.entities.teams['blue']);
        var moreBlue = LOO(castle.entities.teams['blue']) - LOO(castle.entities.teams['orange']);
        var dominantColor = null;
        if (moreOrange > 0) {
            dominantColor = 'orange';
        } else if (moreBlue > 0) {
            dominantColor = 'blue'
        }
        if (castle.color[0].color === castle.color[1].color) {
            castle.color[1].color = dominantColor;
            castle.color[1].percent = 0;
        }
        if (dominantColor) {
            var index = 0;
            var oneOfCurrent = false;
            if (dominantColor === castle.color[0].color || dominantColor === castle.color[1].color) {
                oneOfCurrent = true;
            }
            if (!oneOfCurrent) {
                if (castle.color[0].color === 'grey') {
                    index = 0
                } else index = 1;
            } else {
                if (castle.color[0].color === dominantColor) {
                    index = 0;
                } else index = 1;
            }
            castle.color[index].percent += Math.abs(moreOrange) * this.percentPerEntity;
            castle.color[(index + 1) % 2].percent -= Math.abs(moreOrange) * this.percentPerEntity
        }
        if (castle.color[0].color === 'grey' && castle.color[1].color !== 'grey') {
            if (castle.color[1].percent <= 0) {
                castle.color[1].color = 'grey';
            } else if (castle.color[1].percent >= 1) {
                if (castle.color[1].color === 'orange') {
                    castle.color[0].color = 'blue';
                } else castle.color[0].color = 'orange';
            }
        }
        if (castle.color[1].percent > 1) {
            castle.color[1].percent = 1;
            castle.color[0].percent = 0;
        } else if (castle.color[1].percent < 0) {
            castle.color[1].percent = 0;
            castle.color[0].percent = 1;
        }
        if (castle.color[0].percent > 1) {
            castle.color[0].percent = 1;
            castle.color[1].percent = 0;
        } else if (castle.color[0].percent < 0) {
            castle.color[0].percent = 0;
            castle.color[1].percent = 1;
        }
    },
    setCastleColors: function() {
        var castles = this.castles;
        var changes = {};
        for (var c in castles) {
            this.attackCastle(castles[c])
            changes[c] = castles[c].color;
        }
        return changes;
    },
    clearEntitiesInCastles: function() {
        var castles = this.castles;
        var teams = this.teams;
        for (var c in castles) {
            if (!castles[c]['entities']) {
                castles[c]['entities'] = {};
            }
            if (!castles[c]['entities']['teams']) {
                castles[c]['entities']['teams'] = {};
            }
            for (var t in teams) {
                if (!castles[c]['entities']['teams'][teams[t]]) {
                    castles[c]['entities']['teams'][teams[t]] = {};
                }
                castles[c]['entities']['teams'][teams[t]] = {};
            }
        }
    },
    setEntitiesInCastles: function(e) {
        var castles = this.castles;
        var rx = this.castleRadius / 2.5;
        var ry = this.castleRadius / 3;
        for (var c in castles) {
            if (e.playerId != -1 && Math.pow((e.x - castles[c].x), 2) / Math.pow(rx, 2) + Math.pow((e.y - castles[c].y), 2) / Math.pow(ry, 2) < 1) {
                castles[c]['entities']['teams'][e.team][e.id] = e;
            }
        }
    },
    setPlayerEntityAtCastle: function(e) {
        var playerCastles = this.playerCastles;
        var rx = castleRadius / 2.5;
        var ry = castleRadius / 3;
        for (var c in castles) {
            //Within the ellipse http://math.stackexchange.com/questions/76457/check-if-a-point-is-within-an-ellipse
            if (e.playerId != -1 && Math.pow((e.x - castles[c].x), 2) / Math.pow(rx, 2) + Math.pow((e.y - castles[c].y), 2) / Math.pow(ry, 2) < 1) {
                if (!playerCastles[e.playerId]) {
                    playerCastles[e.playerId] = {};
                }
                if (!playerCastles[e.playerId].castles) {
                    playerCastles[e.playerId].castles = {};
                }
                if (!playerCastles[e.playerId].castles[c]) {
                    playerCastles[e.playerId].castles[c] = []
                }
                playerCastles[e.playerId].castles[c].push(e.id);
            }
        }
    }
}
exports.castles = castles;
