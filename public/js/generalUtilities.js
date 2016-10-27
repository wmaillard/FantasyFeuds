function roughSizeOfObject(object) {
    var objectList = [];
    var stack = [object];
    var bytes = 0;
    while (stack.length) {
        var value = stack.pop();
        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (
            typeof value === 'object' && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);
            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function cantor(a, b) {
    a = Number(a);
    b = Number(b);
    return ~~(1 / 2 * (a + b) * (a + b + 1)) + b;
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        1
    ] : null;
}

function getTanDeg(deg) {
    var rad = deg * Math.PI / 180;
    return Math.tan(rad);
}

function LOO(theObject) { //Length of Object
    if (theObject.constructor === Object) {
        return Object.keys(theObject).length;
    } else return 0;
}
function deepCloneArray(array){
  var newArray = $.extend(true, [], array);
  newArray.shift().shift();
  return newArray;
}