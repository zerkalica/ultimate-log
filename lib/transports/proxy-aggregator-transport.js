var proto,
	TransportBroker = require('../transport-broker');

/**
 * ProxyAggregatorTransport
 *
 * @param {Object}            options Options
 * @param {Array.<Transport>} options.transports transports array
 */
function ProxyAggregatorTransport(options) {
	this.name = 'ProxyAggregatorTransport';
	options = options || {};
	this._transports = new TransportBroker({transports: options.transports});
	this.filter = options.filter;
	this._logObjectGroups = {};
}
proto = ProxyAggregatorTransport.prototype;

/**
 * Send log object to transports
 *
 * @param  {Object} logObject Log object, @see Logger.logObject()
 */
proto.log = function ProxyAggregatorTransport_log(logObject) {
	if (logObject === null || typeof logObject !== 'object') {
		throw new TypeError('logObject is not an object');
	}
	if (!logObject.message) {
		throw new ReferenceError('logObject.message is empty');
	}
	if (!logObject.id) {
		throw new TypeError('Log object has no id');
	}

	if (logObject.direct) {
		this._transports.log(logObject);
	} else {
		if (!this._logObjectGroups[logObject.id]) {
			this._logObjectGroups[logObject.id] = [];
		}
		this._logObjectGroups[logObject.id].push(logObject);
	}
};

/**
 * Start session
 *
 * @param  {String} id Session id
 */
proto.sessionStart = function ProxyAggregatorTransport_sessionStart(id) {
	this._transports.sessionStart(id);
};

proto._flushLogObjects = function ProxyAggregatorTransport__flushLogObjects(logObjects) {
	if (Array.isArray(logObjects)) {
		logObjects.forEach(function (logObject) {
			this._transports.log(logObject);
		}.bind(this));
	}
};

/**
 * Session stop
 *
 * @param  {string} id Log session id
 */
proto.sessionStop = function ProxyAggregatorTransport_sessionStop(id) {
	id = id || false;
	this._flushLogObjects(this._logObjectGroups[id]);
	delete this._logObjectGroups[id];
	this._transports.sessionStop(id);
};

/**
 * Reopen log for log rotate
 */
proto.reopen = function ProxyAggregatorTransport_reopen() {
	for (var id in this._logObjectGroups) {
		this._flushLogObjects(this._logObjectGroups[id]);
	}
	this._logObjectGroups = {};
	this._transports.reopen();
};

/**
 * Pass init to all transports
 */
proto.init = function ProxyAggregatorTransport_init() {
	this._transports.init();
};

/**
 * Pass destroy to all transports
 */
proto.destroy = function ProxyAggregatorTransport_destroy() {
	for (var id in this._logObjectGroups) {
		this._flushLogObjects(this._logObjectGroups[id]);
	}
	this._logObjectGroups = {};
	this._transports.destroy();
};

module.exports = ProxyAggregatorTransport;
