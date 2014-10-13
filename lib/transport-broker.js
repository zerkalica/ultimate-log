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
	this._items = {};
}

proto = TransportBroker.prototype;

proto._callTransports = function TransportBroker_callTransports(method, params) {
	for (var id in this._items) {
		var transport = this._items[id].transport;
		transport[method] && transport[method](params);
	}
};

proto.log = function TransportBroker_log(logObject) {
	for (var id in this._items) {
		var item = this._items[id];
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
	Object.keys(this._items).forEach(function (id) {
		this.removeTransport(id);
	}.bind(this));
	this._items = {};
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
	this._items[id] = item;

	return id;
};

/**
 * Remove transport from chain
 *
 * @param  {String} transportId Transport id
 */
proto.removeTransport = function TransportBroker_removeTransport(transportId) {
	var item = this._items[transportId] || {};

	if (!item.transport) {
		throw new TypeError('No transport with id ' + transportId + ' registered');
	}
	var transport = item.transport;

	transport.destroy && transport.destroy();
	delete this._items[transportId];
};

module.exports = TransportBroker;
