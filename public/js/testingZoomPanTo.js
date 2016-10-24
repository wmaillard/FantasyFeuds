


zoomPanTo(entities[1477341859432].x, entities[1477341859432].y, zoom)

function zoomPanTo(x, y, localZoom){  //x, y is mapX, mapY
	var point = mapToScreenPoint(x, y, localZoom);
	var midPoint = {x : canvasWidth / 2, y: canvasHeight / 2}; //This is reset on canvas reset.
	var diffX = Math.abs(midPoint.x - point.x);
	var diffY = Math.abs(midPoint.y - point.y);
	var diffRangeX = 100;
	var diffChangeX = 50;
	var diffRangeY = 100;
	var diffChangeY = 50; 
	var stuck = true;
	//We may need to look at the difference between point.x and midpoint.x when point.x is negative, currently ignoring
	while(diffX < diffRangeX && diffX > 5){
		diffRangeX /= 2;
		diffChangeX /= 2;
	}
	while(diffY < diffRangeY && diffY > 5){
		diffRangeY /= 2;
		diffChangeY /= 2;
	}

	if(diffX > 5 || point.x < 0){
		stuck = false;
		if(midPoint.x > point.x){
			backgroundOffset.x += diffChangeX;
		}else{
			backgroundOffset.x -= diffChangeX;
		}
	}
	if(diffY > 5 || point.y < 0){
		stuck = false;
		if(midPoint.y > point.y){
			backgroundOffset.y += diffChangeY;
		}else{
			backgroundOffset.y -= diffChangeY;
		}
	}
	redrawBackground();

	point = mapToScreenPoint(x, y, zoom);
	midPoint = {x : canvasWidth / 2, y: canvasHeight / 2}; //This is reset on canvas reset.
	diffX = Math.abs(midPoint.x - point.x);
	diffY = Math.abs(midPoint.y - point.y);
	console.log('diffX:', diffX);
	console.log('diffY:', diffY);
	if(!stuck && (diffX > 5 || diffY > 5 || point.x < 0 || point.y < 0)){
		setTimeout(function(){
			zoomPanTo(x, y, zoom)}, 1000 / 30);
	}else if(zoom < 1){
		setTimeout(function(){
			zoomToOne(x, y, zoom);
		})
	}


}


function zoomToOne(x, y){
	var point = mapToScreenPoint(x, y);
	zoomAction({scale: 1.10, center: point});
	if(zoom < 1){
		setTimeout(function(){
			zoomToOne(x, y, zoom);
		}, 1000 / 30)
	}

}
