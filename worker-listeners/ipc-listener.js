var IPCListener,
	proto;

IPCListener = function (options) {
	this.logger       = options.logger;
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};

proto = IPCListener.prototype;

proto.attach = function (cluster) {
	cluster.on('online', this.onOnline.bind(this));
};

proto.onOnline = function (worker) {
	worker.on('message', this.onIPCMessage.bind(this, worker));
};

proto.onIPCMessage = function (worker, processMessage) {
	if (processMessage.namespace === this.rpcNamespace) {
		this.logger[processMessage.proc](processMessage.data);
	}
};

module.exports = IPCListener;
