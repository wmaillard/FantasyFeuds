

function isInWindow(x, y, width, height){
    if(width && height){
        // x, y is the center of the box
      return isInWindow(x - width / 2, y - height / 2) || isInWindow(x + width / 2, y - height / 2) || isInWindow(x + width / 2, y + height / 2) || isInWindow(x - width / 2, y + height / 2);
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







