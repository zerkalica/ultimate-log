var Logger,
	proto,
	e = require('./exceptions');

/**
 * @class Logger
 * @classdesc Base logger component
 *
 * @param {Object}                           options                Options object
 * @param {Object.<String, IdAggregator>}    options.aggregators    Hashmap of aggregators object
 * @param {Function|undefined}               options.serialize      Serialize function for message data
 * @param {Object.<LoggerSession>}           options.loggerSession  Logger session object
 * @param {Object.<IPCTransport>[]}          options.transports     Transports array
 * @param {Number}                           options.sessionLifeTime Max session lifetime miliseconds
 *
 * @this Logger
 */
Logger = function (options) {
	this.name    = 'Logger';
	options = options || {};
	this.aggregators = options.aggregators || {};
	this.LoggerSession = options.loggerSession;
	this.sessionLifeTime = options.sessionLifeTime || 10000;
	this.transports = options.transports || [];
	this.serialize = options.serialize;
	this._sessionIds = {};
};
proto = Logger.prototype;

/**
 * Send to log
 *
 * @param {String|Object} logObject.message      Log message
 * @param {String} logObject.type                Severity of message: debug, info, warn, error
 * @param {String} logObject.id                  Session id
 * @param {String|undefined} logObject.namespace Session namespace (for change aggregator type)
 * @param {String|undefined} logObject.session   Any session data object
 */
proto.logObject = function (logObject) {
	function isString(val) {
		return (Object.prototype.toString.call(val) === '[object String]');
	}

	if (!logObject || !logObject.id) {
		throw new e.LoggerSessionIdNotSpecifiedException();
	}

	if (this.serialize && !isString(logObject.message)) {
		logObject.message = this.serialize(logObject.message);
	}

	var aggregator = logObject.namespace ? this.aggregators[logObject.namespace] : null;

	if (aggregator) {
		aggregator.collect(logObject);
	} else {
		this.transports
			.filter(this._transportFilter.bind(this, logObject))
			.forEach(function (item) {
				item.transport.log(logObject);
			}.bind(this));
	}
};

proto._transportFilter = function (logObject, item) {
	var allFilters = item.filters;
	var isValid    = allFilters || true;

	if (allFilters) {
		var acceptedFilters = allFilters.filter(function (filter) {
			return filter.isValid(logObject);
		});

		//All filters return true
		isValid = acceptedFilters.length === allFilters.length;
	}

	return isValid;
};

proto._callMethod = function(name, params) {
	this.transports.forEach(function (item) {
		var transport = item.transport;
		transport[name] && transport[name](params);
	});
};

/**
 * Reopen log (for logrotate) for all transports 
 */
proto.reopen = function () {
	var namespacesToAffect = {};
	for (var id in this._sessionIds) {
		var ns = this._sessionIds[id].namespace;
		if (ns) {
			namespacesToAffect[ns] = true;
		}
	}

	Object.keys(namespacesToAffect).forEach(function (ns) {
		if (this.aggregators[ns]) {
			this.aggregators[ns].flush(id, this._callMethod.bind(this, 'log'));
		}
	}.bind(this));

	this._callMethod('reopen');
};

/**
 * Calls at process start and notify all transports
 */
proto.processStart = function () {
	this._callMethod('processStart');
};

/**
 * Calls at process kill and notify all transports
 */
proto.processStop = function () {
	for (var id in this._sessionIds) {
		this.sessionStop(id);
	}
	this._callMethod('processStop');
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
proto.sessionStart = function (session) {
	session = session || {};

	if (!session.id) {
		var hrTime = process.hrtime();
		session.id = process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
	}

	if (this._sessionIds[session.id]) {
		throw new e.LoggerSessionNoUnqueIdException(session.id);
	}

	this._callMethod('sessionStart', session);

	var loggerSession = new this.LoggerSession({
		logger: this,
		session: session
	});

	this._sessionIds[session.id] = {
		namespace: session.namespace,
		timerId: setTimeout(this.sessionStop.bind(this, session.id), this.sessionLifeTime)
	};

	return loggerSession;
};

/**
 * Stop logger session
 *
 * @param  {String} id Session id
 */
proto.sessionStop = function (id) {
	var aggregator;
	if (!id) {
		throw new e.LoggerSessionIdNotSpecifiedException();
	}

	if (this._sessionIds[id]) {
		aggregator = this.aggregators[this._sessionIds[id].namespace];
		clearTimeout(this._sessionIds[id].timerId);
		delete this._sessionIds[id];
	}

	if (aggregator) {
		aggregator.flush(id, this._callMethod.bind(this, 'log'));
	}
	this._callMethod('sessionStop', id);
};

module.exports = Logger;
