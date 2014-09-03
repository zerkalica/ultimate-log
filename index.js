'use strict';
var MicroDi = require('./micro-di');
var cluster = require('cluster');

var config = {
	'logger.transport.console': {
		'require': '%root%/transports/console-transport',
		'options': {
			'types': ['info', 'warn', 'error']
		}
	},
	'logger.transport.ipc.child': {
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
					'transport': '@logger.transport.ipc.child'
				},
				{
					'transport': '@logger.transport.console',
					'filters': ['@logger.filter.type.error']
				}
			]
		}
	},
	'logger.master': {
		'require': '%root%/logger',
		'options': {
			'maxRecords': 10000,
			'transports': [
				{
					'transport': '@logger.transport.console',
					'filters': ['@logger.filter.type.all'],
					'aggregator': '@logger.aggregator.request_id'
				},
				{
					'transport': '@logger.transport.file.all',
					'filters': ['@logger.filter.type.all'],
					'aggregator': '@logger.aggregator.request_id'
				},
				{
					'transport': '@logger.transport.file.error',
					'filters': ['@logger.filter.type.error'],
					'aggregator': '@logger.aggregator.request_id'
				}
			]
		}
	},
	'logger.master.process-binder': {
		'require': '%root%/process-binder',
		'options': {
			'reopenSignal': 'SIGHUP',
			'logger': '@logger.master'
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
	var processBinder = microDi.get('logger.master.process-binder');
	var logger        = microDi.get('logger.master');
	var id = process.pid + '-master';
	var workersCount = 3;

	cluster.setupMaster({silent: true});

	processBinder.attach(process);

	logger.processStart();

	logger.log('test 1 from master');
	logger.log('test 2 from master', 'warn');

	for (var i = 0; i < workersCount; i++) {
		cluster.fork();
	}
	logger.log('test 3 from master', 'warn');
};

function child () {
	var logger = microDi.get('logger.child');

	logger.processStart();

	logger.sessionStart(process.pid + '-req-child1', {req: 'test-request1'});
	logger.log('test 1 from child');
	logger.log('test 2 from child', 'error');
	logger.sessionStop();

	logger.sessionStart(process.pid + '-req-child2', {req: 'test-request2'});
	logger.log('test 3 from child');
	logger.log('test 4 from child', 'error');
	logger.sessionStop();

	logger.processStop();
}

if (cluster.isMaster) {
	master();
} else {
	process.send('test');
	child();
}
