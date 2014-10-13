var proto,
	unique = require('./utils/unique');

function transportFilter(logObject, allFilters) {
	var acceptedFilters = allFilters.filter(function (filter) {
		return filter.isValid(logObject);
	});

	//All filters return true
	return acceptedFilters.length === allFilters.length;
}

function TransportBroker(options) {
	this.name = 'TransportBroker';
	options = options || {};
	this._notInitedTransports = options.transports || [];
	if (!Array.isArray(options.transports)) {
		var transports = [];
		for (var name in options.transports) {
			transports.push(options.transports[name]);
		}
		this._notInitedTransports = transports;
	}
	this._transports = {};
}

proto = TransportBroker.prototype;

proto._callTransports = function TransportBroker_callTransports(method, params) {
	for (var id in this._transports) {
		var transport = this._transports[id];
		transport[method] && transport[method](params);
	}
};

proto.log = function TransportBroker_log(logObject) {
	if (typeof logObject.message === 'object') {
		console.warn(logObject);
		throw new Error(logObject);
	}
	for (var id in this._transports) {
		var transport = this._transports[id];
		var filter = transport.filter || [];
		if (!Array.isArray(filter)) {
			filter = [filter];
		}
		if (transportFilter(logObject, filter)) {
			transport.log(logObject);
		}
	}
};

proto.init = function TransportBroker_init() {
	this._notInitedTransports.forEach(function (transport) {
		this.addTransport(transport);
	}.bind(this));
	this._notInitedTransports = [];
};

proto.destroy = function TransportBroker_destroy() {
	Object.keys(this._transports).forEach(function (id) {
		this.removeTransport(id);
	}.bind(this));
	this._transports = {};
};

proto.reopen = function TransportBroker_reopen() {
	this._callTransports('reopen');
};

proto.sessionStart = function TransportBroker_sessionStart(session) {
	this._callTransports('sessionStart', session);
};

proto.sessionStop = function TransportBroker_sessionStop(id) {
	this._callTransports('sessionStop', id);
};

/**
 * Add transport to chain
 *
 * @param {Object} transport Logger transport + filter transport
 *
 * @return {String} transport id
 */
proto.addTransport = function TransportBroker_addTransport(transport) {
	if (!transport) {
		throw new TypeError('No transport in given transport');
	}
	transport.init && transport.init();

	var id = 't.' + unique();
	this._transports[id] = transport;

	return id;
};

/**
 * Remove transport from chain
 *
 * @param  {String} transportId Transport id
 */
proto.removeTransport = function TransportBroker_removeTransport(transportId) {
	var transport = this._transports[transportId] || {};

	if (!transport) {
		throw new TypeError('No transport with id ' + transportId + ' registered');
	}

	transport.destroy && transport.destroy();
	delete this._transports[transportId];
};

module.exports = TransportBroker;
