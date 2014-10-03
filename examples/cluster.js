var cluster   = require('cluster');
var path      = require('path');
var StdLogger = require('../lib/assembled/std-logger');

var logDir    = path.dirname(require.resolve('../index')) + '/logs';

function master() {
	function onDestroy(log) {
		log({message: 'on exit called', type: 'info', direct: false});
	}

	var loggerFactory = StdLogger({
		cluster: cluster,
		reopenSignal: 'SUGHUP',
		onDestroy: onDestroy,
		transports: [
			{
				transport: 'aggregator',
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
			}
		]
	});

	var logger = StdLogger.simpleFacade(loggerFactory);

	var workersCount = 2;
	cluster.setupMaster({silent: true});

	logger.log('master start1');
	logger.log('master start2');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
}

function child () {
	var req = {test: 'test-req'};
	var loggerFactory = StdLogger({
		transports: [
			{
				transport: 'ipc',
				rpcNamespace: 'ultimate-logger'
			}
		]
	});
	var logger = StdLogger.simpleFacade(loggerFactory);
	logger.start({session: req});

	logger.log('test 1 from child');
	logger.log('test 2 from child', 'error');
	logger.stop();

	logger.stop({session: req});
	logger.log('test 3 from child');

	logger.setSessionData(req);

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
