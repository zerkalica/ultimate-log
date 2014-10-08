var stringify = require('json-stringify-safe');
var moment = require('moment');

function getSerializedData(data, dateFormat) {
	var result;
	if (typeof data === 'object' && data instanceof Date) {
		result = moment(data).format(dateFormat || 'YYYY-MM-DD HH:mm:ss.SSS');
	} else if (Array.isArray(data) || typeof data === 'object') {
		result = stringify(data);
	} else {
		result = data;
	}

	return result;
}

module.exports = getSerializedData;
