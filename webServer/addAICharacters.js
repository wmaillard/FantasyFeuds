var Entity = require('./entities');

function addAICharacters() {

  var quar = JSON.stringify(aiEnt);

  var hydraId; // just for testing
  for (var i = 0; i < 500; i++) {

    var newQuar = JSON.parse(quar);
    newQuar.x = ~~(Math.random() * levelWidthPixels);
    newQuar.y = ~~(Math.random() * levelHeightPixels);
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
      newQuar.x = ~~(Math.random() * levelWidthPixels);
      newQuar.y = ~~(Math.random() * levelHeightPixels);
    }
    newQuar.heading.x = newQuar.x;
    newQuar.heading.y = newQuar.y;

    newQuar.id = Date.now() + i * 200;
    allEntities[newQuar.id] = newQuar;

  }

  aiEnt.type = 'hydra';
  aiEnt.height = 175;
  aiEnt.width = 220;
  quar = JSON.stringify(aiEnt);

  for (var i = 0; i < 100; i++) {

    var newQuar = JSON.parse(quar);
    newQuar.x = ~~(Math.random() * levelWidthPixels);
    newQuar.y = ~~(Math.random() * levelHeightPixels);
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
      newQuar.x = ~~(Math.random() * levelWidthPixels);
      newQuar.y = ~~(Math.random() * levelHeightPixels);
    }
    newQuar.heading.x = newQuar.x;
    newQuar.heading.y = newQuar.y;

    newQuar.id = Date.now() + i * 200;
    allEntities[newQuar.id] = newQuar;

    hydraId = newQuar.id; //just for testing

    var nextX = ~~(Math.random() * 200) + newQuar.x / 2; //200 pixels around the current
    var nextY = ~~(Math.random() * 200) + newQuar.y / 2;
    while (blockingTerrain[~~(newQuar.x / 32)][~~(newQuar.y / 32)]) {
      nextX = ~~(Math.random() * 200) + newQuar.x / 2; //200 pixels around the current
      nextY = ~~(Math.random() * 200) + newQuar.y / 2;
    }

    getPath(allEntities[hydraId].x, allEntities[hydraId].y, nextX, nextY, hydraId);

  }

}
