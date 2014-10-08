var proto;
var getSerializedData = require('../utils/get-serialized-data');

/**
 * TokenFormatter
 *
 * @param {Object} options Options
 * @param {String} options.format token string format, ex: %pid%, %message%, %date%
 * @param {Object} options.defaults default tokens map tokenName: value
 */
function TokenFormatter(options) {
	options = options || {};
	this._defaults = options.defaults || {};
	if (typeof options.format !== 'string') {
		throw new TypeError('options.format is not an object');
	}
	this._format = options.format;

	this._regex = new RegExp('%([\\w\\d]+)%', 'g');
	//'%time% %pid% %reqId% %type% [%label%] %message% %meta%'
}
proto = TokenFormatter.prototype;

proto.format = function TokenFormatter_format(logObject) {
	var prop;
	var result = {};
	if (logObject === null || typeof logObject !== 'object' || Array.isArray(logObject)) {
		throw new TypeError('logObject is not an object');
	}
	for (prop in logObject) {
		var val = logObject[prop];
		result[prop] = getSerializedData(val);
	}

	return this._format.replace(this._regex, function TokenFormatter_format_replace(val, match) {
		return (result[match] || this._defaults[match]) || '';
	}.bind(this));
};

module.exports = TokenFormatter;
