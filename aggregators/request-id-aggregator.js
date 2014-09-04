var RequestIdAggregator, proto;

RequestIdAggregator = function (options) {
	this.name = 'RequestIdAggregator';
	this.logObjects = {};
};

proto = RequestIdAggregator.prototype;

proto.collect = function(logObject) {
	if (!this.logObjects[logObject.id]) {
		this.logObjects[logObject.id] = [];
	}
	this.logObjects[logObject.id].push(logObject);
};

proto.flush = function (id, cb) {
	if (Array.isArray(this.logObjects[id])) {
		this.logObjects[id].forEach(cb);
		delete this.logObjects[id];
	}
};

proto.flushAll = function (cb) {
	for (var id in this.logObjects) {
		this.logObjects[id].forEach(cb);
	}
	this.logObjects = {};
};

module.exports = RequestIdAggregator;
