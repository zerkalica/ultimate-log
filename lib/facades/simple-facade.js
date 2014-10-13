var proto;

/**
 * Logger session
 *
 * @param {Object} options Options
 * @param {Object.<Logger>} options.logger
 */
function SimpleFacade(options) {
	this.name    = 'SimpleFacade';
	options      = options || {};
	this._logger = options.logger;
	this._session = null;
}
proto = SimpleFacade.prototype;

proto.init = function SimpleFacade_init() {
	this._logger.init();
};

/**
 * Start session
 * @param  {Object} sessionOptions
 * @return {Object} this
 */
proto.start = function SimpleFacade_start(id) {
	id = this._logger.sessionStart(id);
	this._session = {id: id, data: {}};

	return this;
};

/**
 * Log message
 *
 * @param  {String|Object|Array} message Log message
 * @param  {String} type    Log type: debug, warn, error
 */
proto.log = function SimpleFacade_log(message, type) {
	var logObject     = Object.create(this._session);
	logObject.message = message;
	logObject.type    = type;

	this._logger.log(logObject);
};

/**
 * Set session data
 *
 * @param {Object} data Abstract session data
 */
proto.setData = function SimpleFacade_setSessionData(data) {
	this._session.data = data;
};

/**
 * Stop logger session
 */
proto.stop = function SimpleFacade_stop() {
	this._logger.sessionStop(this._session.id);
};

module.exports = SimpleFacade;
