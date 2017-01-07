 var imagesLoaded = 0;
 var numberOfImages = 400 + 29 * 2; //29 characters and 2 for each
 function convertImgToCanvas(theImage) {
     var canvas = document.createElement('canvas');
     canvas.width = theImage.width;
     canvas.height = theImage.height;
     var ctx = canvas.getContext("2d");
     ctx.drawImage(theImage, 0, 0);
     return canvas;
 }

 function anotherImageLoaded() {
     imagesLoaded++;
     $('.pace-progress').css({
         '-webkit-transform': 'translate3d(' + ((imagesLoaded / numberOfImages) * 100) + '%, 0px, 0px)',
         '-moz-transform': 'translate3d(' + ((imagesLoaded / numberOfImages) * 100) + '%, 0px, 0px)',
         '-ms-transform': 'translate3d(' + ((imagesLoaded / numberOfImages) * 100) + '%, 0px, 0px)',
         '-o-transform': 'translate3d(' + ((imagesLoaded / numberOfImages) * 100) + '%, 0px, 0px)',
         'transform': 'translate3d(' + ((imagesLoaded / numberOfImages) * 100) + '%, 0px, 0px)'
     });
     if (imagesLoaded === numberOfImages) {
         for (var c in characterImages) {
             characterImages[c] = convertImgToCanvas(characterImages[c])
         }
         for (var i in scene.tiles.tile.img) {
             scene.tiles.tile.img[i] = convertImgToCanvas(scene.tiles.tile.img[i])
         }
         $('.pace').removeClass('pace-active').addClass('pace-inactive');
         imagesDoneLoading();
     }
 }

 function imagesDoneLoading() {
     $('#closeIntro').click(function(e) {
         if (true || $('#skipTutorial').is(':checked')) {
             for (var i in firstTime) {
                 firstTime[i] = false;
             }
         } else {
             $('#showShop').addClass('breathing');
         }
         if ($('#screenName').val() === "") {
             $("#screenName").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
         } else {
             name = $('#screenName').val();
             socket.emit('name', name);
             $('#startInfo').toggle();
             $('#introTeamBox').toggle();
             setTimeout(function() {
                 $('#introTeamBox').fadeOut('slow');
             }, 1000)
         };
         if (playerTeam === 'blue') {
             //cacheMapTiles()
             zoomPanTo(castles[1].x, castles[1].y, zoom, { x: false, y: false }, true)
             zoomToOne(castles[1].x, castles[1].y, .35);
         } else if (playerTeam === 'orange') {
             //cacheMapTiles(true);
             zoomPanTo(castles[4].x, castles[4].y, zoom, { x: false, y: false }, true)
             zoomToOne(castles[4].x, castles[4].y, .35);
         }
     });
     $('#closeIntro').text('Play!').removeClass('disabled');
 };

 function runTips(i) {
     if ($('#startInfo').is(":visible")) {
         setTimeout(function() {
             $('#didYouKnow').fadeTo('slow', .01, function() {
                 $('#didYouKnow').text(tips[i]);
                 $('#didYouKnow').fadeTo('slow', 1);
                 i++;
                 i %= tips.length;
                 runTips(i);
             })
         }, 3000);
     }
 }
 var quality = 'low';

 function cacheMapTiles(reverse) {
     function loadThem(i) {
         var img = new Image();
         img.onload = anotherImageLoaded;
         img.src = 'https://s3-us-west-2.amazonaws.com/fantasyfeudssmallmap/100/tile' + i + '_100' + quality + '.png';
         img = null;
     }
     if (reverse) {
         for (var i = 399; i <= 0; i--) {
             loadThem(i);
         }
     } else {
         for (var i = 0; i < 400; i++) {
             loadThem(i);
         }
     }
 }
 cacheMapTiles();
 runTips(0);
