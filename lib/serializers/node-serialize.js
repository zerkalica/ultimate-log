'use strict';
var nodeSerialize = require('node-serialize').serialize;

function isObject(val) {
	return (typeof val === 'object');
}

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

function isArray(val) {
	return Array.isArray(val);
}

/**
 * Serialize message
 *
 * @param  {Object|String|Array} message Log message
 *
 * @return {String}         Serialized log message
 */
module.exports = function serialize(message) {
	if (isArray(message)) {
		message = message.map(function (item) {
			return isString(item) ? item : nodeSerialize(item);
		}).join("\n");
	} else if (isObject(message)) {
		message = nodeSerialize(message);
	}

	return message;
};
