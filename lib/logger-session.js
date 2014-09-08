var LoggerSession,
	proto;

/**
 * Logger session
 *
 * @param {Object} options Options
 * @param {Object} options.session Log session, see @Logger.startSession()
 * @param {Object.<Logger>} options.logger
 */
LoggerSession = function (options) {
	this.name      = 'LoggerSession';
	options        = options || {};
	this.session   = options.session;
	this.logger    = options.logger;
};
proto = LoggerSession.prototype;

/**
 * Log message
 *
 * @param  {String|Object|Array} message Log message
 * @param  {String} type    Log type: debug, warn, error
 */
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

/**
 * Stop logger session
 */
proto.stop = function () {
	this.logger.sessionStop(this.session.id);
};

module.exports = LoggerSession;
