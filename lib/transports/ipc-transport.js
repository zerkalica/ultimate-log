var proto;
var Serializer = require('circular-serializer');

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {Object} options.process
 * @param {Array}  options.fallbackTransports
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
function IPCTransport(options) {
	this.name = 'IPCTransport';
	options = options || {};
	this._process = options.process || process;
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
	this.filter = options.filter;
	this._fallbackTransports = options.fallbackTransports || [];

	this._call = (this._process.send ? this._ipcCall : this._fallbackCall).bind(this);

	['sessionStart', 'sessionStop', 'reopen'].forEach(function (method) {
		this[method] = this._call.bind(this, method);
	}.bind(this));
	this._serializer = Serializer();
}
proto = IPCTransport.prototype;

proto._ipcCall = function IPCTransport__ipcCall(proc, data) {
	this._process.send({namespace: this.rpcNamespace, proc: proc, data: this._serializer.serialize(data)});
};

proto._fallbackCall = function IPCTransport__fallbackCall(proc, data) {
	this_.fallbackTransports.forEach(function (transport) {
		transport[proc] && transport[proc](data);
	});
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
