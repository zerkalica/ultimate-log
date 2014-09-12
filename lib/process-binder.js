var ProcessBinder,
	proto;

/**
 * Process binder
 *
 * @param {Object} options Options
 * @param {String} options.reopenSignal reopen signal ,default: SIGHUP
 * 
 */
ProcessBinder = function ProcessBinder(options) {
	this.name = 'ProcessBinder';
	this.reopenSignal = options.reopenSignal || 'SIGHUP';
};

proto = ProcessBinder.prototype;

/**
 * Attach to logger and calls processStart
 *
 * @param  {Object.<Logger>} logger Logger opject
 */
proto.attach = function ProcessBinder_attach(logger) {
	process.on(this.reopenSignal, this._onReopenLog.bind(this, logger));
	process.on('exit', this._onExit.bind(this, logger));
	logger.init();
};

proto._onReopenLog = function ProcessBinder__onReopenLog(logger) {
	logger.reopen();
};

proto._onExit = function ProcessBinder__onExit(logger) {
	logger.destroy();
};

module.exports = ProcessBinder;
