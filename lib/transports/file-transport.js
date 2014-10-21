'use strict';
var proto,
	WritableFileStream = require('writable-file-stream'),
	TokenFormatter = require('../formatters/token-formatter');

/**
 * File transport
 * 
 * @param {Object} options Options
 * @param {String} options.fileName log file name
 * @param {Initeger} options.bufferSize log file memory buffer size
 * @param {Object.<Formatter>} options.formatter logObject formatter
 * @param {LogStream|undefined} options.streamProto stream or empty for default
 */
function FileTransport(options) {
	this.name          = 'FileTransport';
	options            = options || {};
	if (!options.fileName) {
		throw new ReferenceError('options.fileName is not given');
	}
	this._bufferSize   = options.bufferSize || 0;
	this._formatter    = options.formatter || new TokenFormatter({format: '[%type%][%id%]: %message%'});
	this._fileName     = options.fileName;
	this.filter        = options.filter;
	this._stream       = null;
}

proto = FileTransport.prototype;

proto.init = function FileTransport_init() {
	this._stream = WritableFileStream(this._fileName, {
		bufferSize: this._bufferSize
	});
};

proto.destroy = function FileTransport_destroy() {
	this._stream.end();
};

proto.log = function FileTransport_log(logObject) {
	if (logObject === null || typeof logObject !== 'object') {
		throw new TypeError('logObject is not an object');
	}
	if (!logObject.message) {
		throw new ReferenceError('logObject.message is empty');
	}

	this._stream.write(this._formatter.format(logObject) + "\n");
};

proto.reopen = function FileTransport_reopen() {
	this._stream.reopen();
};

module.exports = FileTransport;
