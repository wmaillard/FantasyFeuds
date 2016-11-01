function limitBackgroundOffset(){
    var returnValue = {x: false, y: false};
    if(backgroundOffset.x > 0){
        backgroundOffset.x = 0
        returnValue.x = true;
    }
    if(backgroundOffset.y > 0 ){
       backgroundOffset.y = 0;
       returnValue.y = true; 
    }
    if($('#gameContainer').width() - backgroundOffset.x * zoom > levelWidth * size * zoom){
         backgroundOffset.x = $('#gameContainer').width() / zoom - levelWidth * size;
         returnValue.x = true;
     }
    if($('#gameContainer').height()- backgroundOffset.y * zoom > levelHeight * size * zoom){
        backgroundOffset.y = $('#gameContainer').height() / zoom - levelHeight * size;
        returnValue.y = true;
    } 
    return returnValue;

}

CanvasRenderingContext2D.prototype.drawSafeImage = function(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight){
  if(!canvasWidth || !canvasHeight){
    canvasWidth = $('#gameContainer').width();
    canvasHeight = $('#gameContainer').height();
  }
  if (dx  < canvasWidth && dy < canvasHeight && dx >= 0 && dy >= 0)
        this.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}