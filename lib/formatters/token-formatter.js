var proto;

function TokenFormatter(options) {
	options = options || {};
	if (typeof options.format !== 'string') {
		throw new TypeError('options.format is not an object');
	}
	this._format = options.format;

	this._regex = new RegExp('%([\\w\\d]+)%', 'g');
}
proto = TokenFormatter.prototype;

proto.format = function TokenFormatter_format(logObject) {
	var result = {};
	if (logObject === null || typeof logObject !== 'object' || Array.isArray(logObject)) {
		throw new TypeError('logObject is not an object');
	}
	for (var prop in logObject) {
		var val = logObject[prop];
		result[prop] = (typeof val === 'object') ? JSON.stringify(val) : val;
	}

	return this._format.replace(this._regex, function TokenFormatter_format_replace(val, match) {
		return result[match];
	});
};

module.exports = TokenFormatter;
