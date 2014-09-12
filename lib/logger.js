var Logger,
	proto,
	e = require('./exceptions'),
	unique = require('./unique');

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
Logger = function Logger(options) {
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
 * Add transport to chain
 *
 * @param {Object} item Logger transport + filter item
 * @param {Object} item.transport Logger transport, calls transport.init
 * @param {Object} item.filter Logger filter
 */
proto.addTransport = function Logger_addTransport(item) {
	var transport = item.transport;
	if (!transport.id) {
		throw new TypeError('Transport has no id');
	}
	this.transports.push(transport);
	transport.init || transport.init();
};

/**
 * Remove transport from chain
 *
 * @param  {String} transportId Transport id
 */
proto.removeTransport = function Logger_removeTransport(transportId) {
	if (typeof transportId === 'object') {
		transportId = transportId.id;
	}

	this.transports = this.transports.filter(function Logger_removeTransport_filter(item) {
		var transport = item.transport;
		if (transport.id === transportId) {
			transport.destroy || transport.destroy();
		} else {
			return true;
		}
	});
};

/**
 * Send to log
 *
 * @param {String|Object} logObject.message      Log message
 * @param {String} logObject.type                Severity of message: debug, info, warn, error
 * @param {String} logObject.id                  Session id
 * @param {String|undefined} logObject.namespace Session namespace (for change aggregator type)
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

	var aggregator = logObject.namespace ? this.aggregators[logObject.namespace] : null;

	if (aggregator) {
		aggregator.collect(logObject);
	} else {
		this.transports
			.filter(this._transportFilter.bind(this, logObject))
			.forEach(function Logger_logObject_filter(item) {
				item.transport.log(logObject);
			}.bind(this));
	}
};

proto._transportFilter = function Logger__transportFilter(logObject, item) {
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

proto._callTransports = function Logger__callTransports(name, params) {
	this.transports.forEach(function (item) {
		var transport = item.transport;
		transport[name] && transport[name](params);
	});
};

/**
 * Reopen log (for logrotate) for all transports 
 */
proto.reopen = function Logger_reopen() {
	var namespacesToAffect = {};
	var logCb = this._callTransports.bind(this, 'log');
	for (var id in this._sessionIds) {
		var ns = this._sessionIds[id].namespace;
		if (ns) {
			namespacesToAffect[ns] = true;
		}
	}

	Object.keys(namespacesToAffect).forEach(function (ns) {
		if (this.aggregators[ns]) {
			this.aggregators[ns].flush(logCb, id);
		}
	}.bind(this));

	this._callTransports('reopen');
};

/**
 * Calls at process start and notify all transports
 */
proto.init = function Logger_init() {
	this._callTransports('init');
};

/**
 * Calls at process kill and notify all transports
 */
proto.destroy = function Logger_destroy() {
	for (var id in this._sessionIds) {
		this.sessionStop(id);
	}
	this._callTransports('destroy');
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
		session.id = unique();
	}

	if (this._sessionIds[session.id]) {
		throw new e.LoggerSessionNoUnqueIdException(session.id);
	}

	this._callTransports('sessionStart', session);

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
proto.sessionStop = function Logger_sessionStop(id) {
	var aggregator;
	var logCb = this._callTransports.bind(this, 'log');
	if (!id) {
		for (var ns in this.aggregators) {
			this.aggregators[ns].flushAll(logCb);
		}
	}

	if (this._sessionIds[id]) {
		aggregator = this.aggregators[this._sessionIds[id].namespace];
		clearTimeout(this._sessionIds[id].timerId);
		delete this._sessionIds[id];
	}

	if (aggregator) {
		aggregator.flush(logCb, id);
	}
	this._callTransports('sessionStop', id);
};

module.exports = Logger;
