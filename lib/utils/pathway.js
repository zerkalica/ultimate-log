var traverse = require('traverse');

function pathway(obj, path) {
	if (typeof path !== 'string') {
		throw new TypeError('path is not dot-separated string');
	}

	var parts = path.split('.');

	return traverse(obj).get(parts);
}

module.exports = pathway;
