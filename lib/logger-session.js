var LoggerSession,
	proto;

/**
 * Logger session
 *
 * @param {Object} options Options
 * @param {Object} options.session Log session, see @Logger.startSession()
 * @param {String} options.session.id Log session id
 * @param {Object.<Logger>} options.logger
 */
LoggerSession = function LoggerSession(options) {
	this.name       = 'LoggerSession';
	options         = options || {};
	if (!options.session || !options.session.id) {
		throw new TypeError('options.session has no id');
	}
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
	var logObject     = Object.create(this._session);
	logObject.message = message;
	logObject.type    = type;

	this._logger.log(logObject);
};

/**
 * Set session data
 *
 * @param {Object} data Abstract session data
 */
proto.setSessionData = function LoggerSession_setSessionData(data) {
	this._session.data = data;
};

/**
 * Stop logger session
 */
proto.stop = function LoggerSession_stop() {
	this._logger.sessionStop(this._session.id);
};

module.exports = LoggerSession;
