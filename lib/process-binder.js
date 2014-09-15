var proto;

/**
 * Process binder
 *
 * @param {Object} options Options
 * @param {String} options.reopenSignal reopen signal ,default: SIGHUP
 * 
 */
function ProcessBinder(options) {
	this.name = 'ProcessBinder';
	this.reopenSignal = options.reopenSignal || 'SIGHUP';
	this.onExit = null;
}
proto = ProcessBinder.prototype;

/**
 * Attach to logger and calls processStart
 *
 * @param  {Object.<Logger>} logger Logger opject
 */
proto.attach = function ProcessBinder_attach(logger) {
	process.on(this.reopenSignal, this._onReopenLog.bind(this, logger));
	process.on('exit', this._onExit.bind(this, logger));

	process.on('SIGINT', process.exit.bind(this, 1));
	process.on('SIGTERM', process.exit.bind(this, 2));

	logger.init();
};

proto._onReopenLog = function ProcessBinder__onReopenLog(logger) {
	logger.reopen();
};

proto._onExit = function ProcessBinder__onExit(logger, code) {
	logger.destroy();
	process.exit(code);
};

module.exports = ProcessBinder;
