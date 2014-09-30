var ProxyAggregatorTransport = require('../../lib/transports/proxy-aggregator-transport');
var helpers    = require('../test-helpers');
var spy        = helpers.spy;
var logObjects = helpers.fixtures;

describe('transports/proxy-aggregator-transport', function () {
	var proxyTransport,
		fakeBroker;
	beforeEach(function () {
		fakeBroker = {
			init: spy(),
			sessionStart: spy(),
			log: spy(),
			reopen: spy(),
			sessionStop: spy(),
			destroy: spy()
		};
		proxyTransport = new ProxyAggregatorTransport({transports: fakeBroker});
	});

	describe('#init', function () {
		var init;
		beforeEach(function () {
			init = proxyTransport.init.bind(proxyTransport);
		});

		it ('should call transports init method if proxy init called', function () {
			init();
			fakeBroker.init.should.have.been.called;
		});
	});

	describe('#sessionStart', function () {
		var sessionStart;
		var testSession = {
			test: 'test-session'
		};
		beforeEach(function () {
			sessionStart = proxyTransport.sessionStart.bind(proxyTransport);
		});

		it ('should call transports sessionStart method if proxy sessionStart called', function () {
			sessionStart(testSession);
			fakeBroker.sessionStart.should.have.been.calledWith(testSession);
		});
	});

	describe('#log', function () {
		var log;
		beforeEach(function () {
			log = proxyTransport.log.bind(proxyTransport);
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
			log.bind(proxyTransport, {}).should.throw(ReferenceError, 'logObject.message is empty');
		});

		it('should not call transports.log if no direct option passed', function () {
			log(logObjects.l1);
			fakeBroker.log.should.not.have.been.called;
		});

		it('should call transports.log if direct option passed', function () {
			log(logObjects.l2);
			fakeBroker.log.should.not.have.been.called;
		});
	});

	describe('#reopen', function () {
		var reopen;
		beforeEach(function () {
			reopen = proxyTransport.reopen.bind(proxyTransport);
		});

		it('should call transports reopen', function () {
			reopen();
			fakeBroker.reopen.should.have.been.calledOnce;
		});

		it('should not call transports.log, if no collected messages', function () {
			reopen();
			fakeBroker.log.should.not.have.been.called;
		});

		it('should call all transports.log all, if collected log messages', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			reopen();
			fakeBroker.log.should.have.been.calledTwice;
		});

		it('should be cleared after reopen', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			reopen();
			fakeBroker.log = spy();
			reopen();
			fakeBroker.log.should.not.have.been.called;
		});
	});

	describe('#sessionStop', function () {
		var sessionStop;
		beforeEach(function () {
			sessionStop = proxyTransport.sessionStop.bind(proxyTransport);
		});

		it('should call transports sessionStop with empty id', function () {
			function run(id) {
				fakeBroker.sessionStop = spy();
				fakeBroker.log = spy();
				sessionStop(id);
				fakeBroker.sessionStop.should.have.been.calledOnce;
			}
			[null, '', false, {}, [], undefined, NaN].forEach(run.bind(this));
		});

		it('should not call transports.log, if no collected messages', function () {
			sessionStop();
			fakeBroker.log.should.not.have.been.called;
		});

		it('should call all transports.log all, if collected log messages', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			sessionStop(logObjects.l2.id);
			fakeBroker.log.should.have.been.calledTwice;
		});

		it('should be cleared after sessionStop', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			sessionStop(logObjects.l2.id);
			fakeBroker.log = spy();
			sessionStop(logObjects.l2.id);
			fakeBroker.log.should.not.have.been.called;
		});
	});

	describe('#destroy', function () {
		var destroy;
		beforeEach(function () {
			destroy = proxyTransport.destroy.bind(proxyTransport);
		});

		it('should call transports.destroy', function () {
			destroy();
			fakeBroker.destroy.should.have.been.calledOnce;
		});

		it('should not call transports.log, if no collected messages', function () {
			destroy();
			fakeBroker.log.should.not.have.been.called;
		});

		it('should call all transports.log all, if collected log messages', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			destroy(logObjects.l2.id);
			fakeBroker.log.should.have.been.calledTwice;
		});

		it('should be cleared after destroy', function () {
			proxyTransport.log(logObjects.l2);
			proxyTransport.log(logObjects.l2);
			fakeBroker.log = spy();
			destroy(logObjects.l2.id);
			fakeBroker.log = spy();
			destroy(logObjects.l2.id);
			fakeBroker.log.should.not.have.been.called;
		});
	});
});
