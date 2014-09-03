var IPCTransport, proto;

IPCTransport = function (options) {
	options = options || {};
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};
proto = IPCTransport.prototype;

proto._call = function(proc, data) {
	process.send && process.send({namespace: this.rpcNamespace, proc: proc, data: data});
};

proto.log = function (logObject) {
	this._call('logObject', logObject);
};

proto.sessionStop = function (id) {
	this._call('sessionStop', id);
};

proto.reopen = function () {
	this._call('reopen');
};

module.exports = IPCTransport;
