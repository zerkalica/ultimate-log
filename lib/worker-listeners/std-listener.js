var proto;

function StdListener() {
	this.name = 'StdListener';
}

proto = StdListener.prototype;

StdListener.prototype.attach = function StdListener_attach(logger, cluster) {
	function onMessage(worker, type, messageStream) {
		logger.log({
			message: 'worker: ' + messageStream.toString().trim(),
			type: type,
			direct: true,
			//id: 'w.fb.' + worker.id,
			session: {'worker': worker, 'request': null}
		});
	}
	function onOnline(worker) {
		worker.process.stdout.on('data', onMessage.bind(null, worker, 'info'));
		worker.process.stderr.on('data', onMessage.bind(null, worker, 'error'));
	}
	cluster.on('online', onOnline.bind(this));
};

module.exports = StdListener;
