'use strict';
var proto,
	LogStream = require('logstream').LogStream;

function FileTransport(options) {
	this.fileName = options.fileName;
	this.name = 'FileTransport';
	this.stream   = null;
}
proto = FileTransport.prototype;

proto.init = function FileTransport_init() {
	this.stream = new LogStream(this.fileName);
};

proto.destroy = function FileTransport_destroy() {
	this.stream.end();
};

proto.log = function FileTransport_log(logObject) {
	this.stream.write('[' + logObject.type + '][' + logObject.id + ']: ' + logObject.message + "\n");
};

proto.reopen = function FileTransport_reopen() {
	this.stream.reopen();
};

module.exports = FileTransport;
