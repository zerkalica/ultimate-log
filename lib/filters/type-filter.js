var proto;

/**
 * Filter log messages by type
 * @param {Object} options Filter options
 * @param {String[]} options.types Array of valid filter types
 */
function TypeFilter(options) {
	this.name = 'TypeFilter';
	options = options || {};
	this.types = options.types || [];
	if (!Array.isArray(this.types)) {
		throw new TypeError('options.types is not array of type strings');
	}
}
proto = TypeFilter.prototype;

/**
 * Is valid log object
 *
 * @param {Object} logObject Log object
 * @param {String} logObject.type type of log message
 * 
 * @return {Boolean}
 */
proto.isValid = function TypeFilter_isValid(logObject) {
	if (!logObject || !logObject.type) {
		throw new TypeError('Log object has no type property');
	}

	return this.types.indexOf(logObject.type) !== -1;
};

module.exports = TypeFilter;
