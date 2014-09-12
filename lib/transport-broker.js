var proto,
	unique = require('./unique');

function transportFilter(logObject, allFilters) {
	var acceptedFilters = allFilters.filter(function (filter) {
		return filter.isValid(logObject);
	});

	//All filters return true
	return acceptedFilters.length === allFilters.length;
}

function TransportBroker(options) {
	options = options || {};
	this._notInitedTransports = options.transports || [];
	this._transports = {};
}

proto = TransportBroker.prototype;

proto._callTransports = function TransportBroker_callTransports(method, params) {
	for (var id in this._transports) {
		var transport = this._transports[id].transport;
		transport[method] && transport[method](params);
	}
};

proto.log = function TransportBroker_log(logObject) {
	for (var id in this._transports) {
		var item = this._transports[id];
		if (transportFilter(logObject, item.filters || [])) {
			item.transport.log(logObject);
		}
	}
};

proto.init = function TransportBroker_init() {
	this._notInitedTransports.forEach(function (item) {
		this.addTransport(item);
	}.bind(this));
	this._notInitedTransports = [];
};

proto.destroy = function TransportBroker_destroy() {
	this._transports = {};
	Object.keys(this._transports).forEach(function (id) {
		this.removeTransport(id);
	}.bind(this));
};

proto.reopen = function TransportBroker_reopen() {
	this._callTransports('reopen');
};

proto.sessionStart = function TransportBroker_sessionStart() {
	this._callTransports('sessionStart');
};

proto.sessionStop = function TransportBroker_sessionStop() {
	this._callTransports('sessionStop');
};

/**
 * Add transport to chain
 *
 * @param {Object} item Logger transport + filter item
 * @param {Object} item.transport Logger transport, calls transport.init
 * @param {Object} item.filter Logger filter
 *
 * @return {String} transport id
 */
proto.addTransport = function TransportBroker_addTransport(item) {
	item = item || {};
	if (!item.transport) {
		throw new TypeError('No transport property in given item');
	}
	var transport = item.transport;
	transport.init && transport.init();

	var id = 't.' + unique();
	this._transports[id] = item;

	return id;
};

/**
 * Remove transport from chain
 *
 * @param  {String} transportId Transport id
 */
proto.removeTransport = function TransportBroker_removeTransport(transportId) {
	var transport = this._transports[transportId];
	if (!transport) {
		throw new TypeError('No transport with id ' + transportId + ' registered');
	}
	transport.destroy && transport.destroy();
	delete this._transports[transportId];
};

module.exports = TransportBroker;
