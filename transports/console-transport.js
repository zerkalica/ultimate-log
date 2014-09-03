'use strict';
var ConsoleTransport, proto;

ConsoleTransport = function (options) {
	options = options || {};
};
proto = ConsoleTransport.prototype;

proto.log = function (options) {
	var method = console[options.type] || console.log;
	method('[' + options.id + ']: ' + options.message);
};

module.exports = ConsoleTransport;
