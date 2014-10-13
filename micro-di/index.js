var commonConfig = require('./config');
var ul           = require('../lib/ul');

module.exports = function ulMicroDiRegistrator(microDi) {
	microDi
		.addModules({UltimateLogger: ul})
		.addConfig(commonConfig);
};
