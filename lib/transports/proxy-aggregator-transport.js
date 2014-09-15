var proto,
	TransportBroker = require('../transport-broker');

function ProxyAggregatorTransport(options) {
	options = options || {};
	this.name = 'ProxyAggregatorTransport';
	this._transports = new TransportBroker({transports: options.transports || []});
	this._logObjectGroups = {};
}
proto = ProxyAggregatorTransport.prototype;

/**
 * Send log object to transports
 *
 * @param  {Object} logObject Log object, @see Logger.logObject()
 */
proto.log = function ProxyAggregatorTransport_log(logObject) {
	logObject = logObject || {};
	if (!logObject.id) {
		throw new TypeError('Log object has no id');
	}

	if (logObject.drain) {
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
 * @param  {Object} sessionObject Session
 * @param  {String} sessionObject.id                  Session id
 * @param  {Object|undefined} sessionObject.data      Any session data
 */
proto.sessionStart = function ProxyAggregatorTransport_sessionStart(sessionObject) {
	this._transports.sessionStart(sessionObject);
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
