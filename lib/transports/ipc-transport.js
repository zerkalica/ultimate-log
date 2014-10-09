var proto;
var serializer = require('../utils/serializer');

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {Object} options.process
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
function IPCTransport(options) {
	this.name = 'IPCTransport';
	options = options || {};
	this._process = options.process || process;
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';

	this._call = (this._process.send ? this._ipcCall : this._consoleCall).bind(this);

	['sessionStart', 'sessionStop', 'reopen'].forEach(function (method) {
		this[method] = this._call.bind(this, method);
	}.bind(this));
}
proto = IPCTransport.prototype;

proto._ipcCall = function IPCTransport__ipcCall(proc, data) {
	this._process.send({namespace: this.rpcNamespace, proc: proc, data: serializer.serialize(data)});
};

proto._consoleCall = function IPCTransport__consoleCall(proc, data) {
	if (proc === 'log') {
		var method = console[data.type] || console.log;
		method(data);
	}
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
