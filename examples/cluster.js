var cluster   = require('cluster');
var path      = require('path');
var stdLogger = require('../loggers/std-logger');

var logDir    = path.dirname(require.resolve('../index')) + '/tests/logs';

function master() {
	var loggerFactory = stdLogger.master({
		cluster: cluster,
		transports: [
			{
				transport: 'console',
				types: ['debug', 'info', 'warn', 'error']
			},
			{
				transport: 'file',
				fileName:  logDir + '/app.log',
				types: ['debug', 'info', 'warn', 'error']
			}
		]
	});
	var workersCount = 2;
	cluster.setupMaster({silent: true});

	var logger = loggerFactory.sessionStart({namespace: 'master'});

	logger.log('master start');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
};

function child () {
	var req = {test: 'test-req'};
	var loggerFactory = stdLogger.child();
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
