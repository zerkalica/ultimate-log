var proto;

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
function IPCTransport(options) {
	options = options || {};
	this.name = 'IPCTransport';
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
	['log', 'sessionStart', 'sessionStop', 'reopen'].forEach(function (method) {
		this[method] = this._call.bind(this, method);
	}.bind(this));
}
proto = IPCTransport.prototype;

proto._call = function IPCTransport__call(proc, data) {
	process.send && process.send({namespace: this.rpcNamespace, proc: proc, data: data});
};

module.exports = IPCTransport;
