'use strict';
var IdAggregator,
	proto;

/**
 * Aggregate log messages by id and flush them to transports
 */
IdAggregator = function IdAggregator() {
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
proto.collect = function IdAggregator_collect(logObject) {
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
 * @param  {Function} cb Aggregator pass each log object to this method
 * @param  {String}   id Log session id
 */
proto.flush = function IdAggregator_flush(cb, id) {
	if (typeof cb !== 'function') {
		throw new TypeError('cb is not a function: ' + typeof cb);
	}

	if (!id) {
		throw new TypeError('id is empty');
	}

	if (Array.isArray(this._logObjects[id])) {
		this._logObjects[id].forEach(cb);
		delete this._logObjects[id];
	}
};

/**
 * Flush all collected messages
 *
 * @param  {Function} cb Aggregator pass each log object to this method
 */
proto.flushAll = function IdAggregator_flushAll(cb) {
	for (var i in this._logObjects) {
		this.flush(cb, i);
	}
};

module.exports = IdAggregator;
