'use strict';
var Logger,
	proto,
	nodeSerialize = require('node-serialize').serialize;

function isObject(val) {
	return (typeof val === 'object');
}

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

function isArray(val) {
	return Array.isArray(val);
}

var serialize = function(message) {
	if (isArray(message)) {
		message = message.map(function (item) {
			return isString(item) ? item : nodeSerialize(item);
		}).join("\n");
	} else if (isObject(message)) {
		message = nodeSerialize(message);
	}

	return message;
};

var LoggerSessionIdNotSpecifiedException = function () {
	this.name = 'LoggerSessionIdNotSpecifiedException';
	this.message = 'Id is not specified in logger.sessionStop or logger.logObject';
};
proto = LoggerSessionIdNotSpecifiedException.prototype;
proto = new Error();
proto.constructor = LoggerSessionIdNotSpecifiedException;

var SessionLoggerNoUnqueIdException = function (id) {
	this.name = 'SessionLoggerNoUnqueIdException';
	this.message = 'Id ' + id + ' is not unique in logger.logObject';
};
proto = SessionLoggerNoUnqueIdException.prototype;
proto = new Error();
proto.constructor = SessionLoggerNoUnqueIdException;

var LoggerSession = function (options) {
	this.name    = 'LoggerSession';
	this.id      = options.id;
	this.session = options.session;
	this.logger  = options.logger;
};
proto = LoggerSession.prototype;

proto.log = function (message, type) {
	this.logger.logObject({
		message: serialize(message),
		type: type || 'info',
		id: this.id,
		session: this.session
	});
};

proto.stop = function () {
	this.logger.sessionStop(this.id);
};

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
	var filteredTransports = this.transports.filter(this._transportFilter.bind(this, logObject));
	filteredTransports.forEach(function (item) {
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

proto._callMethod = function(name) {
	this.transports.forEach(function (item) {
		var transport = item.transport;
		transport[name] && transport[name]();
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

proto.sessionStart = function (id, sessionObject) {
	if (!id) {
		var hrTime = process.hrtime();
		id = process.pid + '-' + (hrTime[0] * 1000000 + hrTime[1] / 1000);
	}

	if (this._sessionIds[id]) {
		throw new SessionLoggerNoUnqueIdException(id);
	}

	var loggerSession = new LoggerSession({
		id: id,
		logger: this,
		session: serialize(sessionObject)
	});
	this._callMethod('sessionStart');

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
