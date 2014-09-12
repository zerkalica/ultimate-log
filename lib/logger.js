var proto,
	e = require('./exceptions'),
	TransportBroker  = require('./transport-broker'),
	unique = require('./unique');

/**
 * @class Logger
 * @classdesc Base logger component
 *
 * @param {Object}                           options                Options object
 * @param {Function|undefined}               options.serialize      Serialize function for message data
 * @param {Object.<LoggerSession>}           options.loggerSession  Logger session object
 * @param {Object.<IPCTransport>[]}          options.transports     Transports array
 * @param {Number}                           options.sessionLifeTime Max session lifetime miliseconds
 *
 * @this Logger
 */
function Logger(options) {
	options = options || {};
	this.LoggerSession = options.loggerSession;
	this.sessionLifeTime = options.sessionLifeTime || 10000;
	this._transports = new TransportBroker({transports: options.transports || []});

	this.serialize = options.serialize;
	this._sessionIds = {};
}
proto = Logger.prototype;

/**
 * Send to log
 *
 * @param {String|Object} logObject.message      Log message
 * @param {String} logObject.type                Severity of message: debug, info, warn, error
 * @param {String} logObject.id                  Session id
 * @param {String|undefined} logObject.session   Any session data object
 */
proto.logObject = function Logger_logObject(logObject) {
	function isString(val) {
		return (Object.prototype.toString.call(val) === '[object String]');
	}
	if (!logObject || !logObject.id) {
		throw new e.LoggerSessionIdNotSpecifiedException();
	}

	if (this.serialize && !isString(logObject.message)) {
		logObject.message = this.serialize(logObject.message);
	}

	this._transports.log(logObject);
};

/**
 * Reopen log (for logrotate) for all transports 
 */
proto.reopen = function Logger_reopen() {
	this._transports.reopen();
};

/**
 * Calls at process start and notify all transports
 */
proto.init = function Logger_init() {
	this._transports.init();
};

/**
 * Calls at process kill and notify all transports
 */
proto.destroy = function Logger_destroy() {
	this._transports.destroy();
};

/**
 * Start logger session
 *
 * @param  {Object|undefined} session             Session
 * @param  {String|undefined} session.namespace   Session namespace
 * @param  {String|undefined} session.id          Session id
 * @param  {Object|undefined} session.data        Session data
 *
 * @return {Object.<LoggerSession>} Logger session object
 */
proto.sessionStart = function Logger_sessionStart(session) {
	session = session || {};

	if (!session.id) {
		session.id = 's.' + unique();
	}

	if (this._sessionIds[session.id]) {
		throw new e.LoggerSessionNoUnqueIdException(session.id);
	}

	this._transports.sessionStart(session);

	var loggerSession = new this.LoggerSession({
		logger: this,
		session: session
	});
	loggerSession.stop = this.sessionStop.bind(this, session.id);

	this._sessionIds[session.id] = setTimeout(this._sessionStopFallback.bind(this, session.id), this.sessionLifeTime);

	return loggerSession;
};

proto._sessionStopFallback = function Logger__sessionStopFallback(id) {
	console.warn('Session executed too long: ' + id);
	this.sessionStop(id);
};

/**
 * Stop logger session
 *
 * @param  {String} id Session id
 */
proto.sessionStop = function Logger_sessionStop(id) {
	if (this._sessionIds[id]) {
		clearTimeout(this._sessionIds[id]);
		delete this._sessionIds[id];
	}
	this._transports.sessionStop(id);
};

module.exports = Logger;
