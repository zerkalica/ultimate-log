var stringify = require('json-stringify-safe');

var _ = {
	isNumber: function (value) {
		return typeof value == 'number' ||
			value && typeof value == 'object' && toString.call(value) == '[object Number]' || false;
	},
	isBoolean: function (value) {
		return value === true || value === false ||
			value && typeof value == 'object' && toString.call(value) == '[object Boolean]' || false;
	},
	isObject: function (value) {
		return value && typeof value == 'object';
	},
	isArray: function (value) {
		return Array.isArray(value);
	}
};

function getSerializedData(data) {
	var result = '';
	if (_.isArray(data) || _.isObject(data)) {
		result = stringify(data);
	} else if (_.isNumber(data) || _.isBoolean(data)) {
		result = data.toString();
	} else {
		result = data;
	}

	return result;
}

module.exports = getSerializedData;
