var ul = require('../lib/ul');

var defaults = function (config, defaults) {
	config = config || {};

	for (var i in defaults) {
		if (config.hasOwnProperty(i) && typeof config[i] !== 'undefined') {
			config[i] = defaults[i];
		}
	}

	return config;
};

var MasterLogger = function(config) {
	config = defaults(config, {
		sessionLifeTime: 10000,
		aggregate: true,
		cluster: undefined,
		rpcNamespace: 'ultimate-logger',
		reopenSignal: 'SUGHUP',
		transports: [
			{
				transport: 'console',
				types: ['debug', 'info', 'warn', 'error']
			},
			{
				transport: 'file',
				fileName: './test/logs/app.log',
				types: ['debug', 'info', 'warn', 'error']
			}
		]
	});

	var configToTransports = function (item) {
		return {
			transport: ul.Transports[item.transport] ? new ul.Transports[item.transport](item) : new ul.Transports.console(item),
			filters:   item.types ? [new ul.Filters.type(item)] : undefined
		};
	};

	var logger = new ul.Logger({
		serialize:     ul.NodeSerializer,
		loggerSession: ul.LoggerSession,
		sessionLifeTime: config.sessionLifeTime,
		aggregators: aggregate ? {request: new ul.IdAggregator()} : undefined,
		transports: config.transports.map(configToTransports)
	});
	if (config.cluster) {
		var listener = new ul.Listeners.ipc({
			logger: logger,
			config.rpcNamespace
		});
		listener.attach(config.cluster);

		listener = new ul.Listeners.std({
			logger: logger,
		});
		listener.attach(cluster);
	}

	if (config.reopenSignal) {
		var pb = new ul.ProcessBinder({
			reopenSignal: config.reopenSignal
		});

		pb.attach(logger);
	}

	return logger;
};

var ChildLogger = function (config) {
	return MasterLogger(defaults(config, {
		aggregate: false,
		transports: [
			{
				transport: 'ipc',
				rpcNamespace: 'ultimate-logger'
			}
		]
	}));
};

module.exports = {
	child: ChildLogger,
	master: MasterLogger
};

/**
 * var StdLogger = require('ultimate-logger/loggers/std-logger');
 * var logger    = StdLogger.master({rpcNamespace: 'ultimate-logger'});
 */
