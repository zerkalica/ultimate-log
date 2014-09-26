var FileTransport = require('../../lib/transports/file-transport');
var helpers    = require('../test-helpers');
var chai       = helpers.chai;
var logObjects = helpers.fixtures;

describe('transports/file-transport', function () {
	var fileTransport,
		log,
		FakeStreamProto, streamMethods;

	beforeEach(function () {
		streamMethods = {
			end:    chai.spy(),
			write:  chai.spy(),
			reopen: chai.spy()
		};
		FakeStreamProto = function FakeStreamProto(options) {
			return streamMethods;
		};
		fileTransport = new FileTransport({streamProto: FakeStreamProto, fileName: 'test.name.txt'});
		
	});

	describe('#init', function () {
		it('should create new stream object from prototype', function () {
			var FakeStreamProto = chai.spy();
			var fileTransport = new FileTransport({streamProto: FakeStreamProto, fileName: 'test.name.txt'});
			fileTransport.init();
			FakeStreamProto.should.have.been.called.once;
		});
	});

	describe('#destroy', function () {
		it('should throw exceptions if no init called before', function () {
			fileTransport.destroy.bind(fileTransport).should.throw(TypeError);
		});
		it('should calls end method of stream object', function () {
			fileTransport.init();
			fileTransport.destroy();
			streamMethods.end.should.have.been.called.once;
		});
	});

	describe('#reopen', function () {
		it('should throw exceptions if no init called before', function () {
			fileTransport.reopen.bind(fileTransport).should.throw(TypeError);
		});
		it('should calls reopen method of stream object', function () {
			fileTransport.init();
			fileTransport.reopen();
			streamMethods.reopen.should.have.been.called.once;
		});
	});

	describe('#log', function () {
		var log;
		beforeEach(function () {
			fileTransport.init();
			log = fileTransport.log.bind(fileTransport);
		});
		afterEach(function () {
			fileTransport.destroy();
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

		it('should write to stream with default type log', function () {
			log({message: 'test'});
			streamMethods.write.should.have.been.called.once;
		});

		it('should write to stream, if valid log type given', function () {
			log({message: 'test', type: 'warn'});
			streamMethods.write.should.have.been.called.once;
		});
	});
});
