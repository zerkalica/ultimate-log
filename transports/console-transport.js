'use strict';
var ConsoleTransport,
	proto;

ConsoleTransport = function (options) {
	this.name = 'ConsoleTransport';
	options = options || {};
};
proto = ConsoleTransport.prototype;

proto.log = function (logObject) {
	var method = console[logObject.type] || console.log;
	method('[' + logObject.id + ']: ' + logObject.message);
};

module.exports = ConsoleTransport;
