function _pathway(obj, parts) {
	var data;
	if (typeof obj === 'object') {
		var part = parts[0];

		if (obj.hasOwnProperty(part)) {
			data = parts.length > 1 ? _pathway(obj[part], parts.slice(1)) : obj[part];
		}
	}

	return data;
}

function pathway(obj, path) {
	if (typeof path !== 'string') {
		throw new TypeError('path is not dot-separated string');
	}

	var parts = path.split('.');

	if (!parts.length) {
		throw new Error('path is empty');
	}

	return _pathway(obj, parts);
}

module.exports = pathway;