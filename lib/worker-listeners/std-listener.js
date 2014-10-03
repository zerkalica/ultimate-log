var proto;

function StdListener() {
	this.name = 'StdListener';
}
proto = StdListener.prototype;

proto.attach = function StdListener_attach(logger, cluster) {
	cluster.on('online', this._onOnline.bind(this, logger));
};

proto._onMessage = function StdListener_onMessage(logger, worker, type, messageStream) {
	logger.log({
		message: 'worker: ' + messageStream.toString().trim(),
		type: type,
		direct: true,
		//id: 'w.fb.' + worker.id,
		session: {'worker.id': worker.id, 'request': null}
	});
};

proto._onOnline = function StdListener_onOnline(logger, worker) {
	worker.process.stdout.on('data', this._onMessage.bind(this, logger, worker, 'info'));
	worker.process.stderr.on('data', this._onMessage.bind(this, logger, worker, 'error'));
};

module.exports = StdListener;
