var path         = require('path');
var masterConfig = require('./master');
var childConfig  = require('./child');

module.exports = function (microDi) {
	microDi.addVariables({
		'ultimate-logger.libdir': path.dirname(require.resolve('../lib/logger')),
		'log.dir': '%project.rootdir%/tests/logs'
	});
	microDi.addConfig(masterConfig);
	microDi.addConfig(childConfig);
};
