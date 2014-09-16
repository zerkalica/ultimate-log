var LoggerSession,
	proto;

/**
 * Logger session
 *
 * @param {Object} options Options
 * @param {Object} options.session Log session, see @Logger.startSession()
 * @param {Object.<Logger>} options.logger
 */
LoggerSession = function LoggerSession(options) {
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
proto.log = function LoggerSession_log(message, type) {
	this.logger.log({
		message: message,
		type: type || 'info',
		id: session.id,
		session: this.session.data
	});
};

/**
 * Set session data
 *
 * @param {Object} data Abstract session data
 */
proto.setData = function LoggerSession_setData(data) {
	this.session.data = data;
};

/**
 * Stop logger session
 */
proto.stop = function LoggerSession_stop() {
	this.logger.sessionStop(this.session.id);
};

module.exports = LoggerSession;
