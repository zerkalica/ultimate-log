var TypeFilter,
	proto;

TypeFilter = function (options) {
	this.name = 'TypeFilter';
	this.types = options.types;
};
proto = TypeFilter.prototype;

proto.isValid = function (options) {
	return this.types.indexOf(options.type) !== -1;
};

module.exports = TypeFilter;
