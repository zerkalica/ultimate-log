'use strict';
var ConsoleTransport,
	proto;

/**
 * Console transport
 */
ConsoleTransport = function (options) {
	this.name = 'ConsoleTransport';
	options = options || {};
};
proto = ConsoleTransport.prototype;

/**
 * Log data to console
 *
 * @param  {Object} logObject Log object
 * @param {String}  logObject.type Type of log message: log, warn, error
 */
proto.log = function (logObject) {
	var method = console[logObject.type] || console.log;
	method('[' + logObject.id + ']: ' + logObject.message);
};

module.exports = ConsoleTransport;
