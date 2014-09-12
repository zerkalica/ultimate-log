'use strict';
var FileTransport,
	proto,
	LogStream = require('logstream').LogStream,
	unique = require('../unique');

FileTransport = function FileTransport(options) {
	this.name     = 'FileTransport';
	this.id       = unique();
	this.fileName = options.fileName;
	this.stream   = null;
};
proto = FileTransport.prototype;

proto.init = function FileTransport_init() {
	this.stream = new LogStream(this.fileName);
};

proto.destroy = function FileTransport_destroy() {
	this.stream && this.stream.end();
};

proto.log = function FileTransport_log(logObject) {
	this.stream.write('[' + logObject.type + '][' + logObject.id + ']: ' + logObject.message);
};

proto.reopen = function FileTransport_reopen() {
	this.stream.reopen();
};

module.exports = FileTransport;
