'use strict';
var proto;

/**
 * Console transport
 */
function ConsoleTransport(options) {
	this.name = 'ConsoleTransport';
}
proto = ConsoleTransport.prototype;

/**
 * Log data to console
 *
 * @param {Object} logObject Log object
 * @param {String}  logObject.type Type of log message: log, warn, error
 */
proto.log = function ConsoleTransport_log(logObject) {
	var method = console[logObject.type] || console.log;
	method('[' + logObject.id + ']: ' + logObject.message);
};

module.exports = ConsoleTransport;
