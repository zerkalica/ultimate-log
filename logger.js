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
	this.sessionLifeTime = options.sessionLifeTime || 10000;
	this.transports = options.transports || [];
	this._sessionIds = {};
};
proto = Logger.prototype;

proto.logObject = function (logObject) {
	if (!logObject || !logObject.id) {
		throw new LoggerSessionIdNotSpecifiedException();
	}
	this.transports
		.filter(this._transportFilter.bind(this, logObject))
		.forEach(function (item) {
			if (item.aggregator) {
				item.aggregator.collect(logObject);
			} else {
				item.transport.log(logObject);
			}
		});
};

proto._transportFilter = function (logObject, item) {
	var transport  = item.transport;
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
 * @param  {Object} id      Session id
 * @param  {String} id.id   Session id
 * @param  {Object} id.data Session data
 * 
 * @param  {String} id   Session id
 * @param  {Object} data Any session data
 *
 * @return {LoggerSession} Logger session object
 */
proto.sessionStart = function (id, data) {
	if (isObject(id)) {
		if (!data) {
			data = id.data;
		}
		id = id.id;
	}

	if (!id) {
		var hrTime = process.hrtime();
		id = process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
	}

	if (this._sessionIds[id]) {
		throw new LoggerSessionNoUnqueIdException(id);
	}

	var loggerSession = new LoggerSession({
		id: id,
		logger: this,
		session: data
	});
	this._callMethod('sessionStart', {id: id, data: data});

	this._sessionIds[id] = {
		session: loggerSession,
		timerId: setTimeout(this.sessionStop.bind(this, id), this.sessionLifeTime)
	};

	return loggerSession;
};

proto.sessionStop = function (id) {
	if (!id) {
		throw new LoggerSessionIdNotSpecifiedException();
	}

	if (this._sessionIds[id]) {
		clearTimeout(this._sessionIds[id].timerId);
		delete this._sessionIds[id];
	}

	this.transports.forEach(function (item) {
		var transport = item.transport;
		item.aggregator && item.aggregator.flush(id, transport.log.bind(transport));
		transport.sessionStop && transport.sessionStop(id);
	});
};

module.exports = Logger;
