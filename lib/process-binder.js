var ProcessBinder,
	proto;

ProcessBinder = function (options) {
	this.name = 'ProcessBinder';
	this.reopenSignal = options.reopenSignal || 'SIGHUP';
};

proto = ProcessBinder.prototype;

proto.attach = function (logger) {
	process.on(this.reopenSignal, this.onReopenLog.bind(this, logger));
	process.on('exit', this.onExit.bind(this, logger));
	logger.processStart();
};

proto.onReopenLog = function (logger) {
	logger.reopen();
};

proto.onExit = function(logger) {
	logger.processStop();
};

module.exports = ProcessBinder;
