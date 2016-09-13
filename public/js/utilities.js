function deepCloneArray(array){
  var newArray = $.extend(true, [], array);
  newArray.shift().shift();
  return newArray;
}
