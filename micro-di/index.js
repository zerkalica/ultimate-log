var path         = require('path');
var commonConfig = require('./common');
var masterConfig = require('./master');
var childConfig  = require('./child');

module.exports = function (microDi, isChild) {
	microDi.addVariables({
		'ultimate-logger.libdir': path.dirname(require.resolve('../lib/logger')),
		'log.dir': '%project.rootdir%/tests/logs'
	});
	microDi.addConfig(commonConfig);
	if (isChild) {
		microDi.addConfig(childConfig);
	} else {
		microDi.addConfig(masterConfig);
	}
};
