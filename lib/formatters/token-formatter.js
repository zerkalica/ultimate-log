var proto;
var Mapper = require('regexp-string-mapper');

/**
 * TokenFormatter
 *
 * @param {Object} options Options
 * @param {String} options.format token string format, ex: %pid%, %message%, %date%
 */
function TokenFormatter(options) {
	options = options || {};
	if (typeof options.format !== 'string') {
		throw new TypeError('options.format is not a string');
	}
	if (!options.format) {
		throw new Error('options.format is empty string');
	}
	this._format = options.format;
	this._mapper = Mapper();
}
proto = TokenFormatter.prototype;

/**
 * Format object
 *
 * @param  {Object} logObject Any log object with props
 *
 * @return {String} Formatted log message
 */
proto.format = function TokenFormatter_format(logObject) {
	return this._mapper.map(this._format, logObject);
};

module.exports = TokenFormatter;
