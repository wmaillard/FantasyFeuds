while(zoom < 2)
	{setTimeout(function(){
		zoomAction({scale : 1.1, center : {x : 300, y: 300}
	})
	}, 100}


setTimeout(zoomAndCheck, 100}



function zoomAndCheck(){
	if(zoom < 2){
		zoomAction({scale : 1.1, center : {x : 300, y: 300}});
		setTimeout(zoomAndCheck, 1000/30);
	}

}


