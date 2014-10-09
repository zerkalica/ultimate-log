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

	process.on('SIGINT', this._onSigInt.bind(this));
	process.on('SIGTERM', this._onSigTerm.bind(this));
};

proto._onSigInt = function ProcessBinder__onSigInt() {
	process.exit(1);
};

proto._onSigTerm = function ProcessBinder__onSigTerm() {
	process.exit(2);
};

proto._onReopenLog = function ProcessBinder__onReopenLog(logger) {
	logger.reopen();
};

proto._onExit = function ProcessBinder__onExit(logger, code) {
	logger.destroy({code: code});
};

module.exports = ProcessBinder;
