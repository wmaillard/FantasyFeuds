while(zoom < 2)
	{setTimeout(function(){
		zoomAction({scale : 1.1, center : {x : 300, y: 300}
	})
	}, 100}


setTimeout(zoomAndCheck, 100}



function zoomAndCheck(center){
	if(zoom < 2){
		zoomAction({scale : 1.1, center : center});
		setTimeout(zoomAndCheck(center), 1000/30);
	}

}


function doubleClickZoom(e){
	setTimeout(zoomAndCheck(convertScreenToMapPoint(e.originalEvent.clientX, e.originalEvent.clientY)), 1000/30)
}