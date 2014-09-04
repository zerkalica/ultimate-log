'use strict';
var Logger,
	proto,
	LoggerSession = require('./logger-session');

function isObject(val) {
	return (typeof val === 'object');
}

var LoggerSessionIdNotSpecifiedException = function () {
	this.name = 'LoggerSessionIdNotSpecifiedException';
	this.message = 'Id is not specified in logger.sessionStop or logger.logObject';
};
proto = LoggerSessionIdNotSpecifiedException.prototype;
proto = new Error();
proto.constructor = LoggerSessionIdNotSpecifiedException;

var LoggerSessionNoUnqueIdException = function (id) {
	this.name = 'LoggerSessionNoUnqueIdException';
	this.message = 'Id ' + id + ' is not unique in logger.logObject';
};
proto = LoggerSessionNoUnqueIdException.prototype;
proto = new Error();
proto.constructor = LoggerSessionNoUnqueIdException;


Logger = function (options) {
	this.name    = 'Logger';
	options = options || {};
	this.aggregators = options.aggregators || {};
	this.LoggerSession = options.loggerSession || LoggerSession;
	this.sessionLifeTime = options.sessionLifeTime || 10000;
	this.transports = options.transports || [];
	this._sessionIds = {};
};
proto = Logger.prototype;

proto.logObject = function (logObject) {
	if (!logObject) {
		throw new LoggerSessionIdNotSpecifiedException();
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

proto.reopen = function () {
	for (var id in this._sessionIds) {
		aggregator = this.aggregators[this._sessionIds[id].namespace];
		if (aggregator) {
			aggregator.flush(id, this._callMethod.bind(this, 'log'));
		}
	}
	this._callMethod('reopen');
};

proto.processStart = function () {
	this._callMethod('processStart');
};

proto.processStop = function () {
	for (var id in this._sessionIds) {
		this.sessionStop(id);
	}
	this._callMethod('processStop');
};

/**
 * Start logger session
 *
 * @param  {Object} session             Session
 * @param  {String} session.namespace   Session namespace
 * @param  {String} session.id          Session id
 * @param  {Object} session.data        Session data
 *
 * @return {LoggerSession} Logger session object
 */
proto.sessionStart = function (session) {
	session = session || {};

	if (!session.id) {
		var hrTime = process.hrtime();
		session.id = process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
	}

	if (this._sessionIds[session.id]) {
		throw new LoggerSessionNoUnqueIdException(session.id);
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

proto.sessionStop = function (id) {
	var aggregator;
	if (!id) {
		throw new LoggerSessionIdNotSpecifiedException();
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
