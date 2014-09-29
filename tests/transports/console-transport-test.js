var ConsoleTransport = require('../../lib/transports/console-transport');
var helpers    = require('../test-helpers');
var spy        = helpers.spy;
var logObjects = helpers.fixtures;

describe('transports/console-transport', function () {
	var consoleTransport,
		fakeConsole;
	beforeEach(function () {
		fakeConsole = {
			log: spy(),
			warn: spy(),
			error: spy()
		};
		consoleTransport = new ConsoleTransport({console: fakeConsole});
		log              = consoleTransport.log.bind(consoleTransport);
	});

	describe('#log', function () {
		var log;
		beforeEach(function () {
			log = consoleTransport.log.bind(consoleTransport);
		});

		it ('should throw TypeError if not an object given', function () {
			var msg = 'logObject is not an object';
			log.bind(null, '').should.throw(TypeError, msg);
			log.bind(null, false).should.throw(TypeError, msg);
			log.bind(null, undefined).should.throw(TypeError, msg);
			log.bind(null, NaN).should.throw(TypeError, msg);
			log.bind(null, null).should.throw(TypeError, msg);
		});

		it('should throw ReferenceError, if empty object given', function () {
			log.bind(null, {}).should.throw(ReferenceError, 'logObject.message is empty');
		});

		it('should output message to console with default type log', function () {
			log({message: 'test', id: 'testId'});
			fakeConsole.log.should.have.been.calledWith('[testId]: test').once;
		});

		it('should output message to console with warn type log', function () {
			log({message: 'test', type: 'warn'});
			fakeConsole.warn.should.have.been.calledWith('[undefined]: test').once;
		});
	});
});
