var proto,
	e = require('./exceptions'),
	TransportBroker  = require('./transport-broker'),
	unique = require('./unique');

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

/**
 * @class Logger
 * @classdesc Base logger component
 *
 * @param {Object}                           options                Options object
 * @param {Function|null}                    options.onDestroy      Method calls on this.destroy
 * @param {Object.<IPCTransport>[]}          options.transports     Transports array
 * @param {Number}                           options.sessionLifeTime Max session lifetime miliseconds
 *
 * @this Logger
 */
function Logger(options) {
	this.name             = 'Logger';
	options               = options || {};
	this._sessionLifeTime = options.sessionLifeTime || 10000;
	this._onDestroy       = options.onDestroy ? options.onDestroy.bind(this) : null;
	this._transports      = new TransportBroker({transports: options.transports || []});
	this._sessionIds      = {};
	this._firstSessionId  = null;
}
proto = Logger.prototype;

/**
 * Send to log
 *
 * @param {Object|String}    logObject           Log object or log messsage string
 * @param {String|Object}    logObject.message   Log message or abstract object to serialize
 * @param {String} [logObject.type]      Severity of message: debug, info, warn, error
 * @param {String} [logObject.id]        Session id
 * @param {String} [logObject.data]   Any session data object
 * @param {String} [type] If firstArgument is string, used as log message type
 */
proto.log = function Logger_log(logObject, type) {
	logObject = isString(logObject) ? {message: logObject, type: type} : (logObject || {});

	if (!this._firstSessionId) {
		this._firstSessionId = 'fb.' + unique();
		logObject.direct = true;
	}
	logObject.id   = logObject.id || this._firstSessionId;
	logObject.type = logObject.type || 'info';

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
	this._onDestroy && this._onDestroy(this.log.bind(this));
	for (var id in this._sessionIds) {
		clearTimeout(this._sessionIds[id]);
		this._transports.sessionStop(id);
	}
	this._sessionIds = {};

	this._transports.destroy();
};

/**
 * Start logger session
 *
 * @param  {String|undefined} id         Session id
 *
 * @return {String} Logger session id
 */
proto.sessionStart = function Logger_sessionStart(id) {
	id = id || ('s.' + unique());

	if (this._sessionIds[id]) {
		throw new e.LoggerSessionNoUnqueIdException(id);
	}

	this._transports.sessionStart(id);

	this._sessionIds[id] = setTimeout(this._sessionStopFallback.bind(this, id), this._sessionLifeTime);

	if (!this._firstSessionId) {
		this._firstSessionId = id;
	}

	return id;
};

proto._sessionStopFallback = function Logger__sessionStopFallback(id) {
	console.warn('Session autoclose: ' + id);
	this.sessionStop(id);
};

/**
 * Stop logger session
 *
 * @param  {String} id Session id
 */
proto.sessionStop = function Logger_sessionStop(id) {
	if (id === this._firstSessionId) {
		this._firstSessionId = null;
	}

	if (this._sessionIds[id]) {
		clearTimeout(this._sessionIds[id]);
		this._transports.sessionStop(id);
		delete this._sessionIds[id];
	}
};

module.exports = Logger;
