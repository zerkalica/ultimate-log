var TypeFilter;
TypeFilter = function (options) {
	this.types = options.types;
};
proto = TypeFilter.prototype;

proto.isValid = function (options) {
	return this.types.indexOf(options.type) !== -1;
};

module.exports = TypeFilter;
