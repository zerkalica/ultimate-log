'use strict';
var IdAggregator,
	proto;

/**
 * Aggregate log messages by id and flush them to transports
 */
IdAggregator = function () {
	this.name = 'IdAggregator';
	this._logObjects = {};
};

proto = IdAggregator.prototype;

/**
 * Collect all log objects
 *
 * @param  {Object} logObject    Log object, @see Logger.logObject
 * @param  {String} logObject.id Log object
 */
proto.collect = function(logObject) {
	logObject = logObject || {};
	if (!logObject.id) {
		throw new TypeError('Log object has no id');
	}
	if (!this._logObjects[logObject.id]) {
		this._logObjects[logObject.id] = [];
	}
	this._logObjects[logObject.id].push(logObject);
};

/**
 * Flush collected messages
 *
 * @param  {[type]}   id Log session id
 * @param  {Function} cb Method, to which pe pass each log object
 */
proto.flush = function (id, cb) {
	if (typeof cb !== 'function') {
		throw new TypeError('cb is not a function: ' + typeof cb);
	}
	if (Array.isArray(this._logObjects[id])) {
		this._logObjects[id].forEach(cb);
		delete this._logObjects[id];
	}
};

module.exports = IdAggregator;
