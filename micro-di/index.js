var commonConfig = require('./common');
var masterConfig = require('./master');
var childConfig  = require('./child');
var ul           = require('../lib/ul');

module.exports = function (microDi, isChild) {
	microDi.addModules({UltimateLogger: ul});
	microDi.addVariables({
		'log.dir': '%project.rootdir%/logs'
	});
	microDi.addConfig(commonConfig);
	microDi.addConfig(isChild ? childConfig : masterConfig);
};
