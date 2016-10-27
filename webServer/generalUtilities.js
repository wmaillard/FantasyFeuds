function LOO(theObject){
	if(theObject.constructor === Object){
		return Object.keys(theObject).length;
	}else return 0;
}
exports.LOO = LOO;