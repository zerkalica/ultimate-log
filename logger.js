'use strict';
var Logger,
	proto,
	serialize = require('node-serialize').serialize;

function isObject(val) {
	return (typeof val === 'object');
}

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

function isArray(val) {
	return Array.isArray(val);
}

Logger = function (options) {
	this.name = 'Logger';
	this.options = options || {transports: []};
	this.session = null;
	this.sessionId = null;
	this.transports = this.options.transports;
	this.maxRecords = this.options.maxRecords || 10000;
	this._recordCount = 0;
};

proto = Logger.prototype;

proto._serialize = function(message) {
	if (isArray(message)) {
		message = message.map(function (item) {
			return isString(item) ? item : serialize(item);
		}).join("\n");
	} else if (isObject(message)) {
		message = serialize(message);
	}

	return message;
};

proto.log = function (message, type) {
	this.logObject({
		message: this._serialize(message),
		type: type || 'info',
		id: this.sessionId,
		session: this.session
	});
};

proto.logObject = function (logObject) {
	var filteredTransports = this.transports.filter(this._transportFilter.bind(this, logObject));

	filteredTransports.forEach(function (item) {
		if (item.aggregator && logObject.session) {
			item.aggregator.collect(logObject);
		} else {
			item.transport.log(logObject);
		}
	});

	this._recordCount++;
	//Fallback for aggregators, if memory limit and no flush called
	if (this.recordCount > this.maxRecords) {
		this.transports.forEach(function (item) {
			item.aggregator && item.aggregator.flushAll(item.transport.log.bind(item.transport));
		});
	}
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
	this.sessionId && this.sessionStop();
	this._callMethod('processStop');
};

proto.sessionStart = function (id, session) {
	this.sessionId = id;
	this.session   = this._serialize(session);
	this._callMethod('sessionStart');
};

proto.sessionStop = function (id) {
	if (!id) {
		this._recordCount = 0;
	}

	id = id || this.sessionId;
	this.transports.forEach(function (item) {
		item.aggregator && item.aggregator.flush(id, item.transport.log.bind(item.transport));
		item.transport.sessionStop && item.transport.sessionStop(id);
	});
};

module.exports = Logger;
