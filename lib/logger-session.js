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
	this.name       = 'LoggerSession';
	options         = options || {};
	this._id        = options.id;
	this._session   = options.session;
	this._logger    = options.logger;
};
proto = LoggerSession.prototype;

/**
 * Log message
 *
 * @param  {String|Object|Array} message Log message
 * @param  {String} type    Log type: debug, warn, error
 */
proto.log = function LoggerSession_log(message, type) {
	this._logger.log({
		message: message,
		type: type || 'info',
		id: this._id,
		session: this._session
	});
};

/**
 * Set session data
 *
 * @param {Object} session Abstract session data
 */
proto.setSessionData = function LoggerSession_setSessionData(session) {
	this._session = session;
};

/**
 * Stop logger session
 */
proto.stop = function LoggerSession_stop() {
	this._logger.sessionStop(this._id);
};

module.exports = LoggerSession;
