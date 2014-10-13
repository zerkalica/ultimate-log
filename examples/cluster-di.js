var MicroDi   = require('micro-di');
var cluster   = require('cluster');
var path      = require('path');
var loggerRegister  = require('../micro-di');

var microDi = MicroDi();

microDi.addVariables({
	'project.rootdir': path.dirname(require.resolve('../index'))
});

loggerRegister(microDi);

var get = microDi.build();

function master() {
	function onDestroy(log) {
		log({message: 'on exit called', type: 'info', direct: false});
	}
	var logger = get('ul.logger.master');
	//logger.init({onDestroy: onDestroy});

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

}

if (cluster.isMaster) {
	master();
} else {
	console.log('tests1');
	child();
	console.error('test2');
}
