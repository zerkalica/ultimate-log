var MicroDi   = require('micro-di');
var cluster   = require('cluster');
var path      = require('path');
var loggerRegister  = require('../micro-di');

var microDi = new MicroDi();

microDi.addVariables({
	'project.rootdir': path.dirname(require.resolve('../index'))
});

loggerRegister(microDi, !cluster.isMaster);

function master() {
	var processBinder   = microDi.get('logger.process-binder');
	var workerListeners = microDi.getByTag('logger.worker-listener');
	var loggerFactory   = microDi.get('logger.master');

	processBinder.attach(loggerFactory);

	var id = process.pid + '-master';
	var workersCount = 2;

	cluster.setupMaster({silent: true});
	workerListeners.forEach(function (workerListner) {
		workerListner.attach(cluster);
	});

	var logger = loggerFactory.sessionStart({namespace: 'master'});

	logger.log('master start');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
};

function child () {
	var req = {test: 'test-req'};
	var processBinder = microDi.get('logger.process-binder');
	var loggerFactory        = microDi.get('logger.child');

	processBinder.attach(loggerFactory);

	var logger = loggerFactory.sessionStart({namespace: 'request', data: req});
	logger.log('test 1 from child');
	logger.log('test 2 from child', 'error');
	logger.stop();

	logger = loggerFactory.sessionStart({namespace: 'request'});
	logger.log('test 3 from child');

	logger.session.data = req;

	setTimeout(function () {
		logger.log('test 4 from child', 'error');
		logger.stop();
	}, 100);

}

if (cluster.isMaster) {
	master();
} else {
	console.log('tests1');
	child();
	console.error('test2');
}
