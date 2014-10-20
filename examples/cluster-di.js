var StdLogger = require('../').di;
var cluster = require('cluster');
var path = require('path');

function onDestroy(log) {
	log({message: 'on exit called', type: 'info', direct: false});
}

var container = StdLogger()
	.addConfig({
		'ultimateLogger': {
			'logsDir': path.dirname(require.resolve('../index')) + '/logs',
			"master": {
				"onDestroy": {
					"@static": "Example1.UltimateLogger.onDestroy"
				},
				"transports": {
					"aggregator": {
						"transports": {
							"fileApp": "@disable"
						}
					}
				}
			}
		}
	})
	.addModules({
		Example1: {
			UltimateLogger: {
				onDestroy: onDestroy
			}
		}
	})
	.getContainer();

function master() {
	var logger = container.get('ultimateLogger.facade.master');
	logger.init();

	var workersCount = 2;
	cluster.setupMaster({silent: true});
	logger.start();
	logger.log('master start1');
	logger.log('master start2');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
}

function child() {
	var req = {test: 'test-req'};
	var logger = container.get('ultimateLogger.facade.child');
	logger.init();
	logger.start({req: req});

	logger.log('test 1 from child');
	logger.log('test 2 from child', 'error');
	logger.stop();

	logger.stop({req: req});
	logger.log('test 3 from child');

	logger.setData({req: req});

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
