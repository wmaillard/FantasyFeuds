function hammerSetup(){

		// get a reference to an element
	var stage = document.getElementById('gameContainer');
    var stage2 = document.getElementById('background');

	// create a manager for that element
	var mc = new Hammer.Manager(stage);
    var mc2 = new Hammer.Manager(stage2);

	// create a recognizer
	var pinch = new Hammer.Pinch();
    var swipe = new Hammer.Swipe();

    var pan = new Hammer.Pan();
    var singleTap = new Hammer.Tap({event: 'singletap', taps: 1});
    var doubleTap = new Hammer.Tap({event: 'doubletap', taps: 2});

    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure(doubleTap);

	// add the recognizer
	mc.add(pinch);
    mc.add(swipe);
    mc.add(singleTap);
    mc.add(pan);
    mc.add(doubleTap);

    mc.on('swipe', function(e){
        var slope = getTanDeg(e.angle);
     
        console.log(slope);
    });

    mc.on('singletap', function(e){

        if(e.tapCount === 1){
            var fakeEvent = {};
            fakeEvent.pointers = [];
            fakeEvent.pointers.push({clientX:e.center.x, clientY:e.center.y})
            clickGameContainer(fakeEvent);
        }
        else if(e.tapCount === 2){
            var point = convertScreenToMapPoint(e.center.x, e.center.y, zoom);
            if(zoom > .95){
                zoomToOne(point.x, point.y, zoomOutLimit)

            }else{
                
                zoomPanTo(point.x, point.y, zoom);
            }
        }


    });
    mc.on('pan', function(e){
        mapMove(e);
        redrawBackground();

    });
    mc.on('panstart', function(e){
        mapMove(e);
        redrawBackground();
    });
    mc.on('panend', function(e){
        mapMove(e);
        redrawBackground();
    });


	
	mc.get('pinch').set({ enable: true });

	mc.on('pinch', function(e){
        console.log('pinching')
        zoomAction(e);
    });

}
