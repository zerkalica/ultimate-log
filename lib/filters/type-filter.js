var TypeFilter,
	proto;

/**
 * Filter log messages by type
 * @param {Object} options Filter options
 * @param {String[]} options.types Array of valid filter types
 */
TypeFilter = function (options) {
	this.name = 'TypeFilter';
	this.types = options.types;
};
proto = TypeFilter.prototype;

/**
 * Is valid log object
 *
 * @param {Object} logObject Log object
 * @param {String} logObject.type type of log message
 * 
 * @return {Boolean}
 */
proto.isValid = function (logObject) {
	return this.types.indexOf(logObject.type) !== -1;
};

module.exports = TypeFilter;
