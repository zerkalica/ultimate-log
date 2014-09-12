var proto;

/**
 * IPC transport
 *
 * @param {Object} options Options
 * @param {String} options.rpcNamespace IPC namespace, default: 'ultimate-logger'
 */
function IPCTransport(options) {
	options = options || {};
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};
proto = IPCTransport.prototype;

proto._call = function IPCTransport__call(proc, data) {
	process.send && process.send({namespace: this.rpcNamespace, proc: proc, data: data});
};

/**
 * Send log object to parent process
 *
 * @param  {Object} logObject Log object, @see Logger.logObject()
 */
proto.log = function IPCTransport_log(logObject) {
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
proto.sessionStart = function IPCTransport_sessionStart(sessionObject) {
	this._call('sessionStart', sessionObject);
};

/**
 * Session stop
 *
 * @param  {string} id Log session id
 */
proto.sessionStop = function IPCTransport_sessionStop(id) {
	this._call('sessionStop', id);
};

/**
 * Reopen log for log rotate
 */
proto.reopen = function IPCTransport_reopen() {
	this._call('reopen');
};

module.exports = IPCTransport;
