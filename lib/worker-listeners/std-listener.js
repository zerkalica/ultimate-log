var StdListener,
	proto;

StdListener = function (options) {
	this.name = 'StdListener';
	this.logger = options.logger;
};

proto = StdListener.prototype;

proto.attach = function (cluster) {
	cluster.on('online', this.onOnline.bind(this));
};

proto.onOnline = function (worker) {
	worker.process.stdout.on('data', this.onStdMessage.bind(this, worker, 'info'));
	worker.process.stderr.on('data', this.onStdMessage.bind(this, worker, 'error'));
};

proto.onStdMessage = function (worker, type, messageStream) {
	this.logger.logObject({
		message: 'fallback from worker console: ' + messageStream.toString(),
		type: type,
		id: worker.id,
		namespace: 'console-fallback',
		session: {'worker': worker, 'request': null}
	});
};

module.exports = StdListener;
