var IPCTransport = require('../../lib/transports/ipc-transport');
var helpers    = require('../test-helpers');
var spy        = helpers.spy;
var logObjects = helpers.fixtures;

describe('transports/ipc-transport', function () {
		var ipcTransport,
			send,
			fakeProcess,
			testNs = 'testNs';

	beforeEach(function () {
		send = spy();
		fakeProcess = {
			send: send,
		};
		ipcTransport = new IPCTransport({process: fakeProcess, rpcNamespace: testNs});
	});

	describe('#log', function () {
		var log;

		beforeEach(function () {
			log = ipcTransport.log.bind(ipcTransport);
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
			log.bind(ipcTransport, {}).should.throw(ReferenceError, 'logObject.message is empty');
		});

		it('should send to process message log', function () {
			var ipcMessage = {
				data: {
					message: 'test'
				},
				namespace: testNs,
				proc: 'log'
			};

			log(ipcMessage.data);
			send.should.have.been.calledWith(ipcMessage).once;
		});

		it('should send message to process with warn type log', function () {
			var ipcMessage = {
				data: {
					message: 'test',
					type: 'warn'
				},
				
				namespace: testNs,
				proc: 'log'
			};
			log({message: ipcMessage.data.message, type: ipcMessage.data.type});
			send.should.have.been.calledWith(ipcMessage).once;
		});
	});

	describe('#sessionStart', function () {
		var sessionStart;

		beforeEach(function () {
			sessionStart = ipcTransport.sessionStart.bind(ipcTransport);
		});

		it('should call process ipc with session start message', function () {
			var ipcMessage = {
				data: {
					data: 'test',
				},
				
				namespace: testNs,
				proc: 'sessionStart'
			};
			sessionStart({data: 'test'});
			send.should.have.been.calledWith(ipcMessage).once;
		});
	});

	describe('#sessionStop', function () {
		var sessionStop;

		beforeEach(function () {
			sessionStop = ipcTransport.sessionStop.bind(ipcTransport);
		});

		it('should call process ipc with session stop message', function () {
			var ipcMessage = {
				data: {
					data: 'test',
				},
				
				namespace: testNs,
				proc: 'sessionStop'
			};
			sessionStop({data: 'test'});
			send.should.have.been.calledWith(ipcMessage).once;
		});
	});

	describe('#reopen', function () {
		var reopen;

		beforeEach(function () {
			reopen = ipcTransport.reopen.bind(ipcTransport);
		});

		it('should call process ipc with reopen message', function () {
			var ipcMessage = {
				data: {
					data: 'test',
				},
				
				namespace: testNs,
				proc: 'reopen'
			};
			reopen({data: 'test'});
			send.should.have.been.calledWith(ipcMessage).once;
		});
	});
});
