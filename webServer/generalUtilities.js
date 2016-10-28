function LOO(theObject){
	if(theObject.constructor === Object){
		return Object.keys(theObject).length;
	}else return 0;
}
function convertId(oldId) {
  return oldId.slice(2);
}
exports.LOO = LOO;
exports.convertId = convertId;