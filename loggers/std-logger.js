var ul = require('../lib/ul');

var loggerDefaults = {
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
};

var setDefaults = function (config, defaults) {
	config = config || {};

	for (var i in defaults) {
		config[i] = config[i] || defaults[i];
	}

	return config;
};

var StdLogger = function(config) {
	setDefaults(config, loggerDefaults);

	var configToTransports = function (item) {
		var Transport = ul.Transports[item.transport] || ul.Transports.console;
		return {
			transport: new Transport(item),
			filters:   item.types ? [new ul.Filters.type(item)] : undefined
		};
	};

	var logger = new ul.Logger({
		serialize:     ul.NodeSerializer,
		loggerSession: ul.LoggerSession,
		sessionLifeTime: config.sessionLifeTime,
		aggregators: config.aggregate ? {request: new ul.IdAggregator()} : undefined,
		transports: config.transports.map(configToTransports)
	});
	if (config.cluster) {
		var listener = new ul.Listeners.ipc({
			logger: logger,
			rpcNamespace: config.rpcNamespace
		});
		listener.attach(config.cluster);

		listener = new ul.Listeners.std({
			logger: logger,
		});
		listener.attach(config.cluster);
	}

	if (config.reopenSignal) {
		var pb = new ul.ProcessBinder({
			reopenSignal: config.reopenSignal
		});

		pb.attach(logger);
	}

	return logger;
};

module.exports = StdLogger;
