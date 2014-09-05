var IdAggregator, proto;

/**
 * Aggregate log messages by id and flush them to transports
 */
IdAggregator = function () {
	this.name = 'IdAggregator';
	this.logObjects = {};
};

proto = IdAggregator.prototype;

/**
 * Collect all log objects
 *
 * @param  {Object} logObject Log object, @see Logger.logObject
 */
proto.collect = function(logObject) {
	if (!this.logObjects[logObject.id]) {
		this.logObjects[logObject.id] = [];
	}
	this.logObjects[logObject.id].push(logObject);
};

/**
 * Flush collected messages
 *
 * @param  {[type]}   id Log session id
 * @param  {Function} cb Method, to which pe pass each log object
 */
proto.flush = function (id, cb) {
	if (Array.isArray(this.logObjects[id])) {
		this.logObjects[id].forEach(cb);
		delete this.logObjects[id];
	}
};

module.exports = IdAggregator;
