var MicroDi = require('./micro-di');
var cluster = require('cluster');
var path    = require('path');
var masterConfig  = require('./di/master');
var childConfig  = require('./di/child');

var microDi = new MicroDi();

microDi.addVariables({
	'project.rootdir': '.'
});

microDi.addVariables({
	'ultimate-logger.libdir': path.dirname(require.resolve('./logger')),
	'log.dir': '%project.rootdir%/tests/logs'
});

function master() {
	microDi.addConfig(masterConfig);

	var processBinder   = microDi.get('logger.process-binder');
	var workerListeners = microDi.getByTag('logger.worker-listener');
	var logger          = microDi.get('logger.master');

	processBinder.attach(logger);

	var id = process.pid + '-master';
	var workersCount = 2;

	cluster.setupMaster({silent: true});
	workerListeners.forEach(function (workerListner) {
		workerListner.attach(cluster);
	});

	var session = logger.sessionStart({namespace: 'master'});

	session.log('master start');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
};

function child () {
	var req = {test: 'test-req'};
	microDi.addConfig(childConfig);

	var processBinder = microDi.get('logger.process-binder');
	var logger        = microDi.get('logger.child');

	processBinder.attach(logger);

	var session = logger.sessionStart({namespace: 'request', data: req});
	session.log('test 1 from child');
	session.log('test 2 from child', 'error');
	session.stop();


	session = logger.sessionStart({namespace: 'request', data: req});
	session.log('test 3 from child');

	setTimeout(function () {
		session.log('test 4 from child', 'error');
		session.stop();
	}, 100);

}

if (cluster.isMaster) {
	master();
} else {
	child();
}
