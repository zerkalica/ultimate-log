var proto,
	serializer = require('circular-serializer').deserialize;

/**
 * IPC worker listener
 *
 * Used in muster process: listens worksers and calls logger
 *
 * @param {Object} options Options
 * @param {String} options.rpcNamespace RPC namespace for IPC communication, default - ultimate-logger
 */
function IPCListener(options) {
	this.name = 'IPCListener';
	options = options || {};
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
}
proto = IPCListener.prototype;

/**
 * Attach to cluster
 *
 * @param  {Object} cluster node.js cluster module instance
 */
proto.attach = function IPCListener_attach(logger, cluster) {
	cluster.on('online', this._onOnline.bind(this, logger));
};

proto._onMessage = function onMessage(logger, worker, processMessage) {
	if (processMessage.namespace === this.rpcNamespace) {
		if (typeof logger[processMessage.proc] !== 'function') {
			throw new TypeError('property Logger.' + processMessage.proc + ' is not a method name');
		}
		logger[processMessage.proc](deserialize(processMessage.data));
	}
};

proto._onOnline = function onOnline(logger, worker) {
	worker.on('message', this._onMessage.bind(this, logger, worker));
};

module.exports = IPCListener;
