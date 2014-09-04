var FileTransport,
	proto,
	LogStream = require('logstream').LogStream;

FileTransport = function (options) {
	this.name = 'FileTransport';
	this.types = options.types;
	this.fileName = options.fileName;
	this.stream   = null;
};
proto = FileTransport.prototype;

proto.processStart = function () {
	this.stream = new LogStream(this.fileName);
};

proto.processStop = function () {
	this.stream && this.stream.end();
	this.stream = null;
};

proto.log = function (options) {
	this.stream.write('[' + options.type + '][' + options.id + ']: ' + options.message);
};

proto.reopen = function () {
	this.stream.reopen();
};

module.exports = FileTransport;
