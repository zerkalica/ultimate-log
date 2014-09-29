var proto;

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {Object} options.process
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
function IPCTransport(options) {
	options = options || {};
	this.name = 'IPCTransport';
	this._process = options.process || process;
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
	['sessionStart', 'sessionStop', 'reopen'].forEach(function (method) {
		this[method] = this._call.bind(this, method);
	}.bind(this));
}
proto = IPCTransport.prototype;

proto._call = function IPCTransport__call(proc, data) {
	this._process.send && this._process.send({namespace: this.rpcNamespace, proc: proc, data: data});
};

proto.log = function IPCTransport_log(logObject) {
	if (logObject === null || typeof logObject !== 'object') {
		throw new TypeError('logObject is not an object');
	}
	if (!logObject.message) {
		throw new ReferenceError('logObject.message is empty');
	}

	return this._call('log', logObject);
};

module.exports = IPCTransport;
