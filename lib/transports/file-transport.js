var FileTransport,
	proto,
	LogStream = require('logstream').LogStream;

FileTransport = function (options) {
	this.name = 'FileTransport';
	this.fileName = options.fileName;
	this.stream   = null;
};
proto = FileTransport.prototype;

proto.processStart = function () {
	this.stream = new LogStream(this.fileName);
};

proto.processStop = function () {
	this.stream && this.stream.end();
};

proto.log = function (logObject) {
	this.stream.write('[' + logObject.type + '][' + logObject.id + ']: ' + logObject.message);
};

proto.reopen = function () {
	this.stream.reopen();
};

module.exports = FileTransport;
