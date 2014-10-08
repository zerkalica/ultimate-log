var proto;
var TOKEN_REGEX = RegExp('%([\\w\\d]+)%', 'g');

/**
 * TokenFormatter
 *
 * @param {Object} options Options
 * @param {String} options.format token string format, ex: %pid%, %message%, %date%
 * @param {[String]} options.timeFormat moment.js format string, ex: YYYY-MM-DD
 * @param {[Object]} options.defaults default tokens map tokenName: value
 * @param {[RegExp]} options.regexp token match regexp, default: RegExp('%([\\w\\d]+)%', 'g')
 */
function TokenFormatter(options) {
	options = options || {};
	this._defaults = options.defaults || {};
	if (typeof options.format !== 'string') {
		console.error(options.format);
		throw new TypeError('options.format is not a string');
	}
	this._format = options.format;
	this._regex = options.regexp || TOKEN_REGEX;
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
	var prop;
	if (logObject === null || typeof logObject !== 'object' || Array.isArray(logObject)) {
		throw new TypeError('logObject is not an object');
	}
	var result = logObject;

	return this._format.replace(this._regex, function TokenFormatter_format_replace(val, match) {
		return (result[match] || this._defaults[match]) || '';
	}.bind(this));
};

module.exports = TokenFormatter;
