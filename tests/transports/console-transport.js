var ConsoleTransport = require('../../lib/transports/console-transport');
var helpers    = require('../test-helpers');
var chai       = helpers.chai;
var logObjects = helpers.fixtures;

describe('transports/console-transport', function () {
	describe('#log', function () {
		var consoleTransport,
			log,
			fakeConsole;

		beforeEach(function () {
			fakeConsole = {
				log: chai.spy(),
				warn: chai.spy(),
				error: chai.spy()
			};
			consoleTransport = new ConsoleTransport({console: fakeConsole});
			log              = consoleTransport.log.bind(consoleTransport);
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
			log({message: 'test'});
			fakeConsole.log.should.have.been.called.once;
		});

		it('should output message to console with warn type log', function () {
			log({message: 'test', type: 'warn'});
			fakeConsole.warn.should.have.been.called.once;
		});
	});
});
