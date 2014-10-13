var StdLogger = require('../').di;
var cluster = require('cluster');
var path = require('path');

function onDestroy(log) {
	log({message: 'on exit called', type: 'info', direct: false});
}

var container = StdLogger()
	.addConfig({
		'ul': {
			'logDir': path.dirname(require.resolve('../index')) + '/logs',
			'transports': {
				"file-error": "@disable"
			},
			"logger": {
				"onDestroy": {
					"@static": "Example1.UltimateLogger.onDestroy"
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
	.build();

function master() {
	var logger = container('ul.master');
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
	var logger = container('ul.child');
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
