var LoggerSession,
	proto;

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
		message: message,
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
