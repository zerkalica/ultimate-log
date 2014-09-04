var LoggerSession,
	proto,
	nodeSerialize = require('node-serialize').serialize;

function isObject(val) {
	return (typeof val === 'object');
}

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

function isArray(val) {
	return Array.isArray(val);
}

var serialize = function(message) {
	if (isArray(message)) {
		message = message.map(function (item) {
			return isString(item) ? item : nodeSerialize(item);
		}).join("\n");
	} else if (isObject(message)) {
		message = nodeSerialize(message);
	}

	return message;
};

LoggerSession = function (options) {
	this.name      = 'LoggerSession';
	options        = options || {};
	this.session   = options.session;
	this.logger    = options.logger;
};
proto = LoggerSession.prototype;

proto.log = function (message, type) {
	var session = this.session;
	this.logger.logObject({
		message: serialize(message),
		type: type || 'info',
		id: session.id,
		namespace: session.namespace,
		session: session.data
	});
};

proto.stop = function () {
	this.logger.sessionStop(this.session.id);
};

module.exports = LoggerSession;
