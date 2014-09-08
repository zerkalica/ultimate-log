var IPCTransport, proto;

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
IPCTransport = function (options) {
	this.name = 'IPCTransport';
	options = options || {};
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};
proto = IPCTransport.prototype;

proto._call = function(proc, data) {
	process.send && process.send({namespace: this.rpcNamespace, proc: proc, data: data});
};

/**
 * Send log object to parent process
 *
 * @param  {Object} logObject Log object, @see Logger.logObject()
 */
proto.log = function (logObject) {
	this._call('logObject', logObject);
};

/**
 * Start session
 *
 * @param  {Object} sessionObject Session
 * @param  {String} sessionObject.id                  Session id
 * @param  {String|undefined} sessionObject.namespace Session namespace
 * @param  {Object|undefined} sessionObject.data      Any session data
 */
proto.sessionStart = function (sessionObject) {
	this._call('sessionStart', sessionObject);
};

/**
 * Session stop
 *
 * @param  {string} id Log session id
 */
proto.sessionStop = function (id) {
	this._call('sessionStop', id);
};

/**
 * Reopen log for log rotate
 */
proto.reopen = function () {
	this._call('reopen');
};

module.exports = IPCTransport;
