var e = {};

function inherit (e) {
	var proto;

	proto = e.prototype;
	proto = new Error();
	proto.constructor = e;

	return e;
}

e.LoggerSessionIdNotSpecifiedException = inherit(function () {
	this.name = 'LoggerSessionIdNotSpecifiedException';
	this.message = 'Id is not specified in logger.sessionStop or logger.logObject';
});

e.LoggerSessionNoUnqueIdException = inherit(function (id) {
	this.name = 'LoggerSessionNoUnqueIdException';
	this.message = 'Id ' + id + ' is not unique in logger.logObject';
});

module.exports = e;
