var IPCListener,
	proto;

/**
 * IPC worker listener
 *
 * Used in muster process: listens worksers and calls logger
 *
 * @param {Object} options Options
 * @param {Object.<Logger>} options.logger    Logger instance
 * @param {String} options.rpcNamespace RPC namespace for IPC communication, default - ultimate-logger
 */
IPCListener = function IPCListener(options) {
	this.logger       = options.logger;
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};

proto = IPCListener.prototype;

/**
 * Attach to cluster
 *
 * @param  {Object} cluster node.js cluster module instance
 */
proto.attach = function IPCListener_attach(cluster) {
	cluster.on('online', this._onOnline.bind(this));
};

proto._onOnline = function IPCListener__onOnline(worker) {
	worker.on('message', this._onIPCMessage.bind(this, worker));
};

proto._onIPCMessage = function IPCListener__onIPCMessage(worker, processMessage) {
	if (processMessage.namespace === this.rpcNamespace) {
		if (typeof this.logger[processMessage.proc] !== 'function') {
			throw new TypeError('property Logger.' + processMessage.proc + ' is not a method name');
		}
		this.logger[processMessage.proc](processMessage.data);
	}
};

module.exports = IPCListener;
