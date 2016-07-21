
//GLOBALS
var APIURL = "https://got-rts.appspot.com";
var useMin = true; //use minimized images
var fps = 60;
var level;
var backgroundChange = true;
var panning = false;
var fullOnPanning = false;
var backgroundOffset = {"x": 0,
                        "y": 0
                       } //Offset of map
var panInterval;
var currentCoords = {'x': 0,
                     'y': 0
                    } //Mouse coordinates, these are for panning
var zoom = 1;
var clearBackground = false;
                           //[x][y] if(p[x][y] == true){alert(something there)}
var blockingTerrain = [];

var firstLoad = true;
var entities = {};
var entitySpeed = 30;
var directions = {
	'S' : 0, 'W' : 1, 'E' : 2, 'N' : 3 
}
var levelWidth;
var levelHeight;
var zoomHappened = false;
var size = 32; //Tile size is 32 x 32


$(function(){
  $('#levelButtons').hide();
  // ********** Login Stuff ****************
  $('#signIn').click(function(){
    if(checkForm($(this).closest('form'))){
     var body = {}
              body.uname = $(newUserName).val();
              body.password = $(newPassword).val();
              $.ajax({
                url: APIURL + '/login',
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(body),
                success: function(data, textStatus, request){
                    Cookies.set('token', request.getResponseHeader('Authorization'));
                    console.log(Cookies.get('token'));
                    Cookies.set('userName', data.uname);
                    Cookies.set('Level', data.Level);
                    Cookies.set('loggedIn', true);

                },
                error: function(data, textStatus, request){
                  console.log("ERROR: ");
                  console.log(data);
                }

              })

          }
    return false;
  })

  $('#signUp').click(function(){
    $('#signInForm').hide();
    $('#signUpForm').show();
    return false;

  })

  $('#signUpSubmit').click(function(){
      if(doubleCheck($(this).closest('form'))){
          var body = {}
          body.uname = $(newUserName).val();
          body.email = $(newEmail).val();
          body.password = $(newPassword).val();
          console.log(JSON.stringify(body));
          $.ajax({
            url: APIURL + '/register',
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify(body),
            success: function(data, textStatus, request){
                Cookies.set('token', request.getResponseHeader('Authorization'));
                console.log(Cookies.get('token'));
                Cookies.set('userName', data.uname);
                Cookies.set('Level', data.Level);
                Cookies.set('loggedIn', true)
                $('form').hide();

            },
            error: function(data, textStatus, request){
                console.log("ERROR: ");
                console.log(data);
            }

          })

      }else{
      	console.log('form problem');
      }

      return false;

  });
  $('#skip').click(function(){
    $('form').hide();
    $('#skip').hide();
    $('#levelButtons').show();
    $('#prompt').text('Choose a level');
  })

// ************End Login

});

// ************** Login functions

function doubleCheck(form){
  var val = checkForm(form);
  var val2 = matchingPasswords(form);
  console.log('doubleCheck' + (val && val2));
  console.log('doubleCheckV' + val)
  return val && val2;
}
function matchingPasswords(form){
    console.log($("#newPassword").val() !== $("#newPasswordAgain").val());
    if($("#newPassword").val() !== $("#newPasswordAgain").val()){
      dangerInput($("#newPassword"));
      dangerInput($("#newPasswordAgain"));
      alert("Your passwords don't match");
      return false;
    }else if($('#newPassword').val()){
      removeDanger($("#newPassword"));
      removeDanger($("#newPasswordAgain"));
      return true;
    }


}
function checkForm(form){
  console.log(form.find('input'));
  var flag = true;

  form.find('input').each(function(){
    if(!$(this).val()){
      dangerInput($(this));
      flag = false;
    }
    else{
      removeDanger($(this));
    }
  })
  return flag;
}
function dangerInput(field){
    field.closest('.form-group').addClass('has-error');
    field.siblings('span').addClass('glyphicon-remove');
}
function removeDanger(field){
    field.closest('.form-group').removeClass('has-error');
    field.siblings('span').removeClass('glyphicon-remove');
}

function blank(field){
  alert($())
}
// End Login functions

function startGame(userLevel){
  level = userLevel;
  $(".text-vertical-center").fadeTo(100, 0, function(){
    $(".text-vertical-center").remove();
    
      $("#background").fadeTo(100, 1, function(){
        $("#foreground").fadeTo(1, 1, function(){
          startLevel();
        });
      });
                                
    
  });
  

  
}
//Loading tiled maps***
//Help from this tutorial: https://hashrocket.com/blog/posts/using-tiled-and-canvas-to-render-game-screens
var scene = {
  zoom: 1,
  tileSets: [],
  context: "",
  layers: [],
  
   renderLayer: function(layer){

      if(layer.type !== 'tilelayer' || !layer.opacity){
        console.log("Error Loading: Not a visible tile layer");
      }
      var scratchCanvas = scene.context.canvas.cloneNode();
      var size = scene.data.tilewidth;
      scratchCanvas = scratchCanvas.getContext("2d");
     //console.log(scratchCanvas.canvas);
     scratchCanvas.canvas.height = layer.height * size;
     scratchCanvas.canvas.width = layer.width * size;
     //console.log(scratchCanvas.canvas.height);
       //   console.log(scratchCanvas.canvas);


     
     if(layer.name === 'Bottom' && firstLoad){
     	levelWidth = layer.width;
     	levelHeight = layer.height;
        blockingTerrain = new Array(layer.width);
        for(var i = 0; i < layer.width; i++){
          blockingTerrain[i] = new Array(layer.height);
          blockingTerrain[i].fill(false);
        }
      }


      if(firstLoad){  //first fill up the array of scratch canvas's, then use later

        layer.data.forEach(function(tile_idx, i){
          
          if(tile_idx === 0){return;}  //tile_idx is the id of the specific tile given by Tiled
        
          var img_x, img_y, s_x, s_y;  //nice description of these variables: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
          
          var tile = -1;
          var tileSetIndex = 0;
          for(tileSetIndex; tileSetIndex < scene.data.tilesets.length - 1; tileSetIndex++){
            if(tile_idx >= scene.data.tilesets[tileSetIndex].firstgid && tile_idx < scene.data.tilesets[tileSetIndex + 1].firstgid){
              tile = scene.data.tilesets[tileSetIndex];
              break;
            }
          }
          if(tile === -1){
              tile = scene.data.tilesets[tileSetIndex];
          }
          tile_idx = tile_idx - tile.firstgid;
          
            
          img_x = (tile_idx % (tile.imagewidth/ size)) * size;  //pinpoint tile on x, y matrix tilesheet
          img_y = ~~(tile_idx / (tile.imagewidth / size)) * size;  //Math.floor avoids floating point blurryness, can use fancy ~~ instead
          
          
          

          
          
          s_x = (i % layer.width) * size;
          s_y = (~~(i / layer.width) * size);

          
          
          //I beleive s_x, s_y is the upper left corner of a tile, so if it is in layer > 0 (check this), then
          //s_x to s_x - size and s_y to s_y - size should be added to terrain array

          if(layer.name !== 'Bottom' && firstLoad){
                blockingTerrain[(i % layer.width)][~~(i / layer.width)] = true;
            }
          
          
          
        //  if(s_x > $('#background').width() || s_y > $('#background').height()){return;} //outside current window, don't load
                                                                                        
          scratchCanvas.drawImage(scene.tileSets[tileSetIndex], img_x, img_y, size, size, s_x, s_y, size, size);

        });
        
        //scene.layers.push(scratchCanvas.canvas.toDataURL()); //save scratch canvas for later
        scene.layers.push(scratchCanvas.canvas);
        scene.context.drawImage(scratchCanvas.canvas, backgroundOffset.x, backgroundOffset.y, $('#background').width() / scene.zoom, $('#background').height() / scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance
        
      }

     
     
     else {  //if all the layers have been previously loaded, use the cache
         
        scene.layers.forEach(function(layer){
            backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x;  //Make sure not to pan outside of map
            backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;      
            (layer.width  + backgroundOffset.x ) / scene.zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() * scene.zoom - layer.width : backgroundOffset.x;
            (layer.height + backgroundOffset.y) / scene.zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() * scene.zoom - layer.height : backgroundOffset.y;
          //var i = $("<img />", {src: src})[0];
         // console.log(layer);
          scene.context.drawImage(layer, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() * scene.zoom, $('#background').height() * scene.zoom, 0, 0, $('#background').width(), $('#background').height()); //draw image from scratch canvas for better performance
        });
      }
     },
    
  renderLayers: function(layers) {
    layers = $.isArray(layers) ? layers : scene.data.layers;  //can pass an array of layers
    layers.forEach(scene.renderLayer);
    firstLoad = false;
  },
  
  loadTileset: function(json){
    this.data = json;

    var itemsProcessed = 0;
    json.tilesets.forEach(function(item, index){ //does this give the images enough time to load?
          scene.tileSets[index] = new Image();
          if(useMin){
          	var imageAddr = item.image;
          	imageAddr = imageAddr.slice(0, -4);//Only if all images are .png, which they are...
          	imageAddr += '-min.png';
          	scene.tileSets[index].src = imageAddr;	
          }
          else{
          	scene.tileSets[index].src = item.image;
          }
          
          (scene.tileSets[index]).onload = function(){
            itemsProcessed++;
            if(itemsProcessed === json.tilesets.length){
              scene.renderLayers(this);
            }
         };
    });

    
  },
  
  load: function(name, ctx, zoom){
    if(clearBackground){
      clearBackground = false;
      ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
    }
    
    scene.zoom =  1 / zoom;
    scene.context = ctx;

    $.getJSON("js/maps/" + name + ".json", function(json){
      scene.loadTileset(json);
   })//.fail(alert("aweful things have happend"));
}
}



$("#gameContainer").on('mousedown', function(e){
	pressMap(e)}).on('mouseup', function(e){
		releasePressMap(e)}).on('mousemove', function(e){
			mapMove(e);	
		});
$("#gameContainer").on('touchstart', function(e){
	pressMap(e, true)}).on('touchend', function(e){
		releasePressMap(e, true)}).on('touchmove', function(e){
			mapMove(e, true);
			return false;
		});

function mapMove(e, mobile){
  if(mobile){
  	e = e.touches[0];
  }
  var changeX = Math.abs(e.clientX - currentCoords.x);
  var changeY = Math.abs(e.clientY - currentCoords.y);
  
  if(!panning){
    fullOnPanning = false;
  }
  
  if((panning && (changeY > 5 || changeX > 5)) || fullOnPanning){
    
    backgroundOffset.x += e.clientX - currentCoords.x;
    backgroundOffset.y += e.clientY - currentCoords.y;
   // backgroundChange = true;

    currentCoords.x = e.clientX;
    currentCoords.y = e.clientY;
    
    $('#gameContainer').css('cursor','move');

    fullOnPanning = true;
    
  }
	
}
function releasePressMap(e, mobile){
  panning = false;
  fullOnPanning = false;

	$('#gameContainer').css('cursor','auto');

}


function pressMap(e, mobile){
  if(mobile){
  	e = e.touches[0];
  }
  currentCoords.x = e.clientX;
  currentCoords.y = e.clientY;
  console.log(isBlocked(~~((currentCoords.x - backgroundOffset.x) / zoom),
  ~~((currentCoords.y - backgroundOffset.y) / zoom)));
  panning = true;
}


function zoomIn(){
   zoom = zoom + .25;
   zoomHappened = true;
  clearBackground = true;
}

function zoomOut(){
  zoom = zoom - .25;
  zoomHappened = true;
  clearBackground = true;
}

$("#zoomIn").click(function(){
  zoomIn();
  return false;
});

$("#zoomOut").click(function(){
  zoomOut();
  return false;
});
  
//IMPORTANT: if you want to convert a event.clientX or Y to work with isBlocked, do this:
//** This is a little off when zoomed in, look into the math eventually if needs be, probably won't need to
//   x = ~~((x - backgroundOffset.x) / zoom); //where 32 is the size of a tile, consistent for our applications
//   y = ~~((y - backgroundOffset.y) / zoom);

function isBlocked(x, y){

  return blockingTerrain[~~(x / 32)][~~(y / 32)];

}
  

  
//End loading tiled maps

function startLevel(){
  
  $('#gameContainer').click(function(e){
    var x = ~~((e.clientX - backgroundOffset.x) / zoom);
    var y = ~~((e.clientY - backgroundOffset.y) / zoom)
    var giant = new Entity({'x': x, 'y': y}, "img/characters/giant.png", 100);
    entities[giant.id] = giant;
    travelSouth(giant);
  
})
  var mapHeight, mapWidth, canvasHeight, canvasWidth, mapYOffset, mapXOffset;

  
  $("#background").attr("height", $("#gameContainer").height());
  $("#background").attr("width", $("#gameContainer").width());
  $("#foreground").attr("height", $("#gameContainer").height());
  $("#foreground").attr("width", $("#gameContainer").width());
  var ctxB = $("#background")[0].getContext("2d");
  var ctxF = $("#foreground")[0].getContext("2d");


  

  var i = 0;
  ctxB.imageSmoothingEnabled = false; //supposedly this should optimize graphics
  
  scene.load(level, ctxB, zoom);
 // backgroundChange = false;

  var entityTrack = 0;
  setInterval(function(){
    entityTrack++;
 // limitBackgroundOffset();
    if(fullOnPanning || zoomHappened){
      scene.load(level, ctxB, zoom);
      drawEntities(entities, ctxF, true);
      zoomHappened = false;
     // backgroundChange = false;
    }
    else if(entityTrack % entitySpeed === 0){ //simple way to animate entities, should be a better way (else if, entities are frozen when pan)
	    	drawEntities(entities, ctxF);
	}

   }, 1000 / fps);  
}

function drawEntities(entities, ctx, lock){
      var scratchCanvas = ctx.canvas.cloneNode();
      scratchCanvas = scratchCanvas.getContext("2d");
      scratchCanvas.canvas.height = levelHeight * 32;
      scratchCanvas.canvas.width = levelHeight * 32;
      scratchCanvas.clearRect(0, 0, scratchCanvas.canvas.width, scratchCanvas.canvas.height); //may not need
      for(var entity in entities){
	if(entities[entity].loaded || true){
		  var img_x = entities[entity].walkingState * entities[entity].size;
		  var img_y = directions[entities[entity].directionPointing] * entities[entity].size;
		  if(entities[entity].walking == true){
		  	if(!lock){
		  		entities[entity].walkingState === 0 ? entities[entity].walkingState = 2 : entities[entity].walkingState = 0;
		  	}
		  }
		  else{
		  	entities[entity].walking.state = 1;
		  }
		  

		scratchCanvas.drawImage(entities[entity].image, img_x, img_y, entities[entity].size, entities[entity].size, entities[entity].x, entities[entity].y, 32, 32);
		
	
	
		}
      }
      ctx.clearRect(0, 0, $("#background").width(), $("#background").height());
      ctx.drawImage(scratchCanvas.canvas, -backgroundOffset.x, -backgroundOffset.y, $('#background').width() / zoom, $('#background').height() / zoom, 0, 0, $('#background').width(), $('#background').height())
}
function limitBackgroundOffset(){
	backgroundOffset.x > 0 ? backgroundOffset.x = 0 : backgroundOffset.x;  //Make sure not to pan outside of map
        backgroundOffset.y > 0 ? backgroundOffset.y = 0 : backgroundOffset.y;      
        (levelWidth  + backgroundOffset.x ) * zoom < $('#background').width() ? backgroundOffset.x = $('#background').width() / zoom - levelWidth : backgroundOffset.x;
        (levelHeight + backgroundOffset.y) * zoom < $('#background').height() ? backgroundOffset.y = $('#background').height() / zoom - levelHeight : backgroundOffset.y;
	
}



/***************** Entities Start Here ***************************************/

function Entity(xyStart, png, health){
	this.x = xyStart.x;
	this.y = xyStart.y;
	this.png = png;
	this.health = health;
	this.directionPointing = 'E';//N, W, E, S
	this.heading = {};
	this.heading.x = this.x;
	this.heading.y = this.y;
	this.action = 'defending'; //attacking, defending
	this.walking = true;
	this.walkingState = '0';
	this.alreadyBeen = [];
  	this.alreadyBeen[this.x] = [];
  	this.alreadyBeen[this.x][this.y] = true; 
	this.size = 150;
	this.image = new Image();
  	this.image.src = png;
  	this.loaded = false;

  	this.image.onload = function(){
  		this.loaded = true;
  	}
  if(!Cookies.get('highestId')){  //This is probably asking for trouble, entity id stuff
    Cookies.set('highestId', 0);
  }
  this.id = Cookies.get('highestId') + 1;
  Cookies.set('highestId', this.id);

};




/*
var giant = new Entity({'x': 150, 'y':0}, "img/characters/giant.png", 100);
var giant2 = new Entity({'x': 0, 'y':0}, "img/characters/giant.png", 100);
var giant3 = new Entity({'x': 0, 'y':100}, "img/characters/giant.png", 100);
var giant4 = new Entity({'x': 100, 'y':800}, "img/characters/giant.png", 100);

entities[giant.id] = giant;  //Why am I storing these in an object and not an array, probably should fix that, how else .push, maybe give
				//each entity a unique id?
entities[giant2.id] = giant2;
entities[giant3.id] = giant3;
entities[giant4.id] = giant4;*/

/*function walkAbout(entity){
	var spin = 0;
	setInterval(function(){
		spin++;
		entity.x += 5;
		entity.y += 5;
		while(isBlocked(entity.x, entity.y) || isBlocked(entity.x + 32, entity.y) || isBlocked(entity.x, entity.y + 32) || isBlocked(entity.x + 32, entity.y + 32)){
			entity.y+=5;
		}
		if(spin % 20 === 0){
			entity.directionPointing === 'E' ? entity.directionPointing = 'S' : entity.directionPointing = 'E';
		}
	}, 1000)
}*/

function travelSouth(entity){
	console.log(entity);
	entity.heading.y = entity.y + 1000;
	setInterval(function(){
		if(shouldGoThere(entity.x, entity.y + 5, entity)){
			addAlreadyBeen(entity);
			entity.y += 5;
			entity.directionPointing = 'S';

		}
		else if(shouldGoThere(entity.x + 5, entity.y, entity)){
			addAlreadyBeen(entity);
			entity.x += 5;
			entity.directionPointing = 'E';
		}
		else if(shouldGoThere(entity.x, entity.y - 5, entity)){
			addAlreadyBeen(entity);
			entity.y -= 5;
			entity.directionPointing = 'N';
		}
		else if(shouldGoThere(entity.x -5, entity.y, entity)){
			addAlreadyBeen(entity);
			entity.x -= 5;
			entity.directionPointing = 'W';
		}
	}, 250)
}

function addAlreadyBeen(entity){
	if(!entity.alreadyBeen[entity.x]){
		entity.alreadyBeen[entity.x] = [];
	}
	entity.alreadyBeen[entity.x][entity.y] = true;
}

function entityIsBlocked(x, y){
	if(isBlocked(x, y) || isBlocked(x + 32, y) || isBlocked(x, y + 32) || isBlocked(x + 32, y + 32)){
		return true;
	}
	return false;
}
function shouldGoThere(x, y, entity){
	return (!entityIsBlocked(x, y)  && (typeof entity.alreadyBeen[x] == 'undefined' || typeof entity.alreadyBeen[x][y + 5] == 'undefined'));
}


  
