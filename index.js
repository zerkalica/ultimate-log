var register = require('./micro-di');
var MicroDi = require('micro-di');

function di() {
	var microDi = MicroDi();
	register(microDi);

	return microDi;
}

module.exports = {
	register: register,
	di: di
};
