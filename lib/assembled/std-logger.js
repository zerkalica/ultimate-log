var ul = require('../ul');
var Traverse = require('traverse');

function pathway(obj, path) {
	return Traverse(obj).get(typeof path === 'string' ? path.split('.') : path);
}

var loggerDefaults = {
	sessionLifeTime: 10000,
	cluster: undefined,
	rpcNamespace: 'ultimate-logger',
	reopenSignal: null,
	onDestroy: null,
	timeFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
	transports: [
		{
			transport: 'console',
			formatter: 'TokenFormatter',
			format: '[%type%][%id%]: %message%',
			types: ['debug', 'info', 'warn', 'error']
		},
		{
			transport: 'file',
			fileName: './test/logs/app.log',
			formatter: 'TokenFormatter',
			format: '[%type%][%id%]: %message%',
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
	var ul = StdLogger.components;

	function configToTransports(item) {
		var Transport = ul.Transports[item.transport];
		if (!Transport) {
			throw new Error('Unknown transport ' + item.transport);
		}
		if (item.transport === 'aggregator') {
			item.transports = item.transports.map(configToTransports);
		}
		if (item.transport === 'ipc' && item.fallbackTransports) {
			item.fallbackTransports = item.fallbackTransports.map(configToTransports);
		}

		item.format = item.format || config.format;

		if (item.formatter || item.format) {
			var fn = item.formatter || 'TokenFormatter';
			var Formatter = typeof fn === 'function' ? fn : pathway(ul.Formatters, fn);
			item.formatter = new Formatter(item);
		}

		return {
			transport: new Transport(item),
			filters:   item.types ? [new ul.Filters.type(item)] : undefined
		};
	}
	var logger = new ul.Logger({
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
	}
	logger.init();

	return logger;
}

StdLogger.simpleFacade = function(logger) {
	return new ul.Facades.Simple({logger: logger});
};

StdLogger.components = ul;

module.exports = StdLogger;
