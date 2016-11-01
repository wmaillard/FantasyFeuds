

function isInWindow(x, y){
      if(!canvasWidth || !canvasHeight){
        canvasWidth = $('#gameContainer').width();
        canvasHeight = $('#gameContainer').height();
      }
    if(x + backgroundOffset.x < canvasWidth / zoom && y + backgroundOffset.y < canvasHeight / zoom && x + backgroundOffset.x >= 0 &&  y + backgroundOffset.y >= 0){
        return true;
    }else return false;
}

function convertScreenToMapPoint(x, y, zoom) {
    var mapPoint = {
        x: x / zoom - backgroundOffset.x,
        y: y / zoom - backgroundOffset.y
    }
    return mapPoint;
}

function mapToScreenPoint(x, y) {
    var screenPoint = {
        x: x * zoom + backgroundOffset.x * zoom,
        y: y * zoom + backgroundOffset.y * zoom
    }
    return screenPoint;
}







