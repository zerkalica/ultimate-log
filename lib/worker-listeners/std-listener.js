var StdListener,
	proto;

/**
 * Stdout/stderr listener
 *
 * @param {Object} options  Options
 * @param {Object.<Logger>} options.logger Logger instance
 */
StdListener = function StdListener(options) {
	this.name = 'StdListener';
	this.logger = options.logger;
};

proto = StdListener.prototype;

/**
 * Attach to cluster
 *
 * @param  {Object} cluster node.js cluster module instance
 */
proto.attach = function StdListener_attach(cluster) {
	cluster.on('online', this._onOnline.bind(this));
};

proto._onOnline = function StdListener__onOnline(worker) {
	worker.process.stdout.on('data', this._onStdMessage.bind(this, worker, 'info'));
	worker.process.stderr.on('data', this._onStdMessage.bind(this, worker, 'error'));
};

proto._onStdMessage = function StdListener__onStdMessage(worker, type, messageStream) {
	this.logger.log({
		message: messageStream.toString().trim(),
		type: type,
		//id: 'w.fb.' + worker.id,
		session: {'worker': worker, 'request': null}
	});
};

module.exports = StdListener;
