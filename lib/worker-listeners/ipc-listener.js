var IPCListener,
	proto;

/**
 * IPC worker listener
 *
 * Used in muster process: listens worksers and calls logger
 *
 * @param {Object} options Options
 * @param {String} options.rpcNamespace RPC namespace for IPC communication, default - ultimate-logger
 */
IPCListener = function IPCListener(options) {
	this.name = 'IPCListener';
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};

proto = IPCListener.prototype;

/**
 * Attach to cluster
 *
 * @param  {Object} cluster node.js cluster module instance
 */
proto.attach = function IPCListener_attach(logger, cluster) {
	var onMessage = function onMessage(worker, processMessage) {
		if (processMessage.namespace === this.rpcNamespace) {
			if (typeof logger[processMessage.proc] !== 'function') {
				throw new TypeError('property Logger.' + processMessage.proc + ' is not a method name');
			}
			logger[processMessage.proc](processMessage.data);
		}
	}

	var onOnline = function onOnline(worker) {
		worker.on('message', onMessage.bind(this, worker));
	}

	cluster.on('online', onOnline.bind(this));
};

module.exports = IPCListener;
