var MicroDi        = require('micro-di');
var loggerRegister = require('./');


function getLogger() {
	var microDi = MicroDi();
	loggerRegister(microDi);

	return microDi;
}

module.exports = getLogger();
