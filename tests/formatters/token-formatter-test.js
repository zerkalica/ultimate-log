var TokenFormatter = require('../../lib/formatters/token-formatter');
var helpers    = require('../test-helpers');
var chai       = helpers.chai;
var logObjects = helpers.fixtures;

describe('formatters/token-formatter', function () {
	var tk;
	beforeEach(function () {
		tk = new TokenFormatter({format: '[%id%] %message%'});
	});
	describe('#format', function () {
		var format;
		beforeEach(function () {
			format = tk.format.bind(tk);
		});

		it('should throw exception, if empty argument given', function () {
			format.bind(tk, '').should.throw(TypeError);
			format.bind(tk, false).should.throw(TypeError);
			format.bind(tk, null).should.throw(TypeError);
			format.bind(tk, 0).should.throw(TypeError);
			format.bind(tk, undefined).should.throw(TypeError);
			format.bind(tk, []).should.throw(TypeError);

			format.bind(tk, 'qewqwewqe').should.throw(TypeError);
		});

		it('should format with undefined if no values for tokens found', function () {
			format({}).should.to.be.equal('[undefined] undefined');
			format({test: 1, test3: 'qweqwe'}).should.to.be.equal('[undefined] undefined');
		});

		it('should return string, if valid log object given', function () {
			format({message: 'testmessage', id: 'testid'}).should.to.be.equal('[testid] testmessage');
			format({message: 'testmessage', id: 'testid', buzz: 'qwe'}).should.to.be.equal('[testid] testmessage');
			format({message: 'testmessage'}).should.to.be.equal('[undefined] testmessage');
		});

		it('should serialize complex logObject property', function () {
			var message = [{test: 'te"st'}, 1123, 'tee"e'];
			format({message: message, id: 'testid'}).should.to.be.equal('[testid] [{"test":"te\\\"st"},1123,"tee\\\"e"]');
		});
	});
});
