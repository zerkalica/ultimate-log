'use strict';
var ConsoleTransport,
	proto,
	unique = require('../unique');

/**
 * Console transport
 */
ConsoleTransport = function ConsoleTransport(options) {
	this.name = 'ConsoleTransport';
	this.id   = unique();
	options   = options || {};
};
proto = ConsoleTransport.prototype;

/**
 * Log data to console
 *
 * @param  {Object} logObject Log object
 * @param {String}  logObject.type Type of log message: log, warn, error
 */
proto.log = function ConsoleTransport_log(logObject) {
	var method = console[logObject.type] || console.log;
	method('[' + logObject.id + ']: ' + logObject.message);
};

module.exports = ConsoleTransport;
