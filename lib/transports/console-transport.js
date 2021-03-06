var proto,
	TokenFormatter = require('../formatters/token-formatter');

/**
 * Console transport
 */
function ConsoleTransport(options) {
	this.name       = 'ConsoleTransport';
	options         = options || {};
	this._formatter = options.formatter || new TokenFormatter({format: '[%id%]: %message%'});
	this._console   = options.console || console;
	this.filter     = options.filter;
}
proto = ConsoleTransport.prototype;

/**
 * Log data to console
 *
 * @param {Object} logObject Log object
 * @param {String}  logObject.type Type of log message: log, warn, error
 */
proto.log = function ConsoleTransport_log(logObject) {
	if (logObject === null || typeof logObject !== 'object') {
		throw new TypeError('logObject is not an object');
	}
	if (!logObject.message) {
		throw new ReferenceError('logObject.message is empty');
	}
	logObject.type = logObject.type || 'log';
	var method = this._console[logObject.type] || this._console.log;
	method(this._formatter.format(logObject));
};

module.exports = ConsoleTransport;
