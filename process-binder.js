'use strict';
var ProcessBinder,
	proto;

ProcessBinder = function (options) {
	this.logger       = options.logger;
	this.reopenSignal = options.reopenSignal || 'SIGHUP';
	this.rpcNamespace = options.rpcNamespace || 'ultimate-logger';
};

proto = ProcessBinder.prototype;

proto.attach = function (process) {
	process.on(this.reopenSignal, this.onReopenLog.bind(this));
	process.on('exit', this.onExit.bind(this));
	process.on('message', this.onChildMessage.bind(this));
};

proto.onReopenLog = function () {
	this.logger.log('Reopen log');
	this.logger.reopen();
};

proto.onExit = function() {
	this.logger.processStop();
};

proto.onChildMessage = function (processMessage) {
	if (processMessage.namespace === this.rpcNamespace) {
		this.logger[processMessage.proc](processMessage.data);
	}
};

module.exports = ProcessBinder;
