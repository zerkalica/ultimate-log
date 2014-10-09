var traverse = require('traverse');
var DATE_LABEL = '[SERIAZED_DATE]:';

function serialize(obj) {
	var cleanObj = traverse(obj).map(function (x) {
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

	return JSON.stringify(cleanObj);
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
