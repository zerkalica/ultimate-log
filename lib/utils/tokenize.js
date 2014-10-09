var serialize = require('./serializer').serialize;
var moment = require('moment');

var DEFAULT_TOKEN_REGEX = RegExp('%(?:([\\w\\d]+)(?:[: ]+([\\w]+)[: ]+([^%]+))?)%([\\s])?', 'g');

/**
 * Replace string tokens to values from token map
 *
 * @param  {String} message Message with tokens
 * @param  {Object} map     Tokens hash map
 * @param  {Object.RegExp}  regex token replace regexp, default: RegExp('%(?:([\\w\\d]+)(?:[: ]+([\\w]+)[: ]+([^%]+))?)%([\\s])?', 'g')
 *
 * @return {String} String with tokens
 */
function tokenize(message, map, regex) {
	if (map === null || typeof map !== 'object' || Array.isArray(map)) {
		throw TypeError('map is not an object');
	}
	if (typeof message !== 'string') {
		throw TypeError('messge is not a string');
	}
	regex = regex || tokenize.TOKEN_REGEX;

	return message.replace(regex, function tokenize_replace(val, token, parser, parserArg, spaces) {
		var value = map[token];
		parser = parser || 'default';
		if (tokenize.map[parser]) {
			value = tokenize.map[parser](value, parserArg);
		}
		return value ? (value + (spaces || '')) : '';
	});
}

tokenize.map = {
	default: function (value) {
		return (Array.isArray(value) || typeof value === 'object') ? serialize(value) : value;
	},
	moment: function (value, arg) {
		return moment(value).format(arg);
	}
};

tokenize.TOKEN_REGEX = DEFAULT_TOKEN_REGEX;

module.exports = tokenize;
