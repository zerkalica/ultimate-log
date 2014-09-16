var ul = require('../lib/ul');

var loggerDefaults = {
	sessionLifeTime: 10000,
	aggregate: true,
	cluster: undefined,
	rpcNamespace: 'ultimate-logger',
	reopenSignal: null,
	onDestroy: null,
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

function setDefaults(config, defaults) {
	config = config || {};

	for (var i in defaults) {
		config[i] = config[i] || defaults[i];
	}

	return config;
}

function StdLogger(config) {
	setDefaults(config, loggerDefaults);

	function configToTransports(item) {
		var Transport = ul.Transports[item.transport] || ul.Transports.console;
		if (item.transport === 'aggregator') {
			item.transports = item.transports.map(configToTransports);
		}

		return {
			transport: new Transport(item),
			filters:   item.types ? [new ul.Filters.type(item)] : undefined
		};
	}

	var logger = new ul.Logger({
		serialize:     ul.NodeSerializer,
		loggerSession: ul.LoggerSession,
		sessionLifeTime: config.sessionLifeTime,
		onDestroy: config.onDestroy,
		transports: config.transports.map(configToTransports)
	});

	if (config.cluster) {
		var listener = new ul.Listeners.ipc({
			rpcNamespace: config.rpcNamespace
		});
		listener.attach(logger, config.cluster);

		listener = new ul.Listeners.std();
		listener.attach(logger, config.cluster);
	}

	if (config.reopenSignal) {
		var pb = new ul.ProcessBinder({
			reopenSignal: config.reopenSignal
		});

		pb.attach(logger);
	} else {
		logger.init();
	}

	return logger;
}

module.exports = StdLogger;
