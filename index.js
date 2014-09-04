var MicroDi = require('./micro-di');
var cluster = require('cluster');

var config = {
	'logger.transport.console': {
		'require': '%root%/transports/console-transport',
		'options': {
			'types': ['info', 'warn', 'error']
		}
	},
	'logger.transport.ipc': {
		'require': '%root%/transports/ipc-transport',
		'options': {
			'rpcNamespace': 'ultimate-logger'
		}
	},
	'logger.transport.file.all': {
		'require': '%root%/transports/file-transport',
		'options': {
			'fileName': '%log.dir%/all.log'
		}
	},
	'logger.transport.file.error': {
		'require': '%root%/transports/file-transport',
		'options': {
			'fileName': '%log.dir%/error.log'
		}
	},
	'logger.filter.type.all': {
		'require': '%root%/filters/type-filter',
		'options': {
			'types': ['info', 'warn', 'error']
		}
	},
	'logger.filter.type.error': {
		'require': '%root%/filters/type-filter',
		'options': {
			'types': ['error']
		}
	},
	'logger.aggregator.request_id': {
		'require': '%root%/aggregators/request-id-aggregator',
		'options': {}
	},

	'logger.child': {
		'require': '%root%/logger',
		'options': {
			'transports': [
				{
					'transport': '@logger.transport.ipc'
					//'filters': ['@logger.filter.type.error']
				}
			]
		}
	},
	'logger.master': {
		'require': '%root%/logger',
		'options': {
			'sessionLifeTime': 10000, // 10 seconds max
			'transports': [
				{
					'transport': '@logger.transport.console',
					'filters': ['@logger.filter.type.all'],
					'aggregator': '@logger.aggregator.request_id'
				}/*,
				{
					'transport': '@logger.transport.file.all',
					'filters': ['@logger.filter.type.all'],
					'aggregator': '@logger.aggregator.request_id'
				},
				{
					'transport': '@logger.transport.file.error',
					'filters': ['@logger.filter.type.error'],
					'aggregator': '@logger.aggregator.request_id'
				}*/
			]
		}
	},

	'logger.master.ipc-worker-listener': {
		'require': '%root%/worker-listeners/ipc-listener',
		'tag': 'logger.worker-listener',
		'options': {
			'rpcNamespace': 'ultimate-logger',
			'logger': '@logger.master'
		}
	},

	'logger.master.std-worker-listener': {
		'require': '%root%/worker-listeners/std-listener',
		//'tag': 'logger.worker-listener',
		'options': {
			'rpcNamespace': 'ultimate-logger',
			'logger': '@logger.master'
		}
	},

	'logger.process-binder': {
		'require': '%root%/process-binder',
		'options': {
			'reopenSignal': 'SIGHUP'
		}
	}
};

var variables = {
	'root': '.',
	'log.dir': 'tests/logs'
};

var microDi = new MicroDi(config);
microDi.setVariables(variables);

function master() {
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

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
};

function child () {
	var processBinder = microDi.get('logger.process-binder');
	var logger = microDi.get('logger.child');

	//processBinder.attach(logger);

	var session = logger.sessionStart();
	session.log('test 1 from child');
	session.log('test 2 from child', 'error');
	session.stop();

	session = logger.sessionStart('req2' + process.pid);
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
