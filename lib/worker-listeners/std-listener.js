var StdListener,
	proto;

/**
 * Stdout/stderr listener
 *
 * @param {Object} options  Options
 * @param {Object.<Logger>} options.logger Logger instance
 */
StdListener = function (options) {
	this.name = 'StdListener';
	this.logger = options.logger;
};

proto = StdListener.prototype;

/**
 * Attach to cluster
 *
 * @param  {Object} cluster node.js cluster module instance
 */
proto.attach = function (cluster) {
	cluster.on('online', this._onOnline.bind(this));
};

proto._onOnline = function (worker) {
	worker.process.stdout.on('data', this._onStdMessage.bind(this, worker, 'info'));
	worker.process.stderr.on('data', this._onStdMessage.bind(this, worker, 'error'));
};

proto._onStdMessage = function (worker, type, messageStream) {
	this.logger.logObject({
		message: 'fallback from worker console: ' + messageStream.toString(),
		type: type,
		id: worker.id,
		namespace: 'console-fallback',
		session: {'worker': worker, 'request': null}
	});
};

module.exports = StdListener;
