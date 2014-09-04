var IdAggregator, proto;

IdAggregator = function (options) {
	this.name = 'IdAggregator';
	this.logObjects = {};
};

proto = IdAggregator.prototype;

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

module.exports = IdAggregator;
