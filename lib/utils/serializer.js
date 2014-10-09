var traverse = require('traverse');
var DATE_LABEL = '[SERIAZED_DATE]:';

function cleanObject(obj) {
	var data;
	if (Array.isArray(obj)) {
		data = obj.map(cleanObject);
	} else if (typeof obj === 'object') {
		data = traverse(obj).map(function (x) {
			if (typeof x === 'function') {
				this.update('[Function]');
			}
			if (this.circular) {
				this.update('[Circular]');
			}
			if (x instanceof Date) {
				this.update(DATE_LABEL + x.toJSON());
			}
		});
	} else {
		data = obj;
	}

	return data;
}

function serializable(obj) {
	return !(obj === true || obj === false || obj === null || typeof obj == 'number');
}

function serialize(obj) {
	obj = cleanObject(obj);
	if (serializable(obj)) {
		obj = JSON.stringify(obj);
	}

	return obj;
}

function deserialize(string) {
	var obj = JSON.parse(string);

	return traverse(obj).map(function (x) {
		if (typeof x === 'string' && x.indexOf(DATE_LABEL) === 0) {
			this.update(new Date(x.substr(DATE_LABEL.length)));
		}
	});
}

module.exports = {
	serialize: serialize,
	deserialize: deserialize
};
