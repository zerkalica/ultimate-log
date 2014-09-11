var IdAggregator = require('../../lib/aggregators/id-aggregator');
var helpers      = require('../test-helpers');
var chai         = helpers.chai;
var logObjects   = require('../fixtures/logObjects');

describe('aggregators/id-aggregator', function () {
	var idAggregator;
	beforeEach(function () {
		idAggregator = new IdAggregator();
	});

	describe('#collect', function () {
		it('should throw TypeError, if no arguments given to collect', function () {
			idAggregator.collect.bind(idAggregator).should.throw(TypeError);
		});

		it('should throw TypeError, if some empty arguments', function () {
			var collect = idAggregator.collect;
			collect.bind(idAggregator, '').should.throw(TypeError, 'Log object has no id');
			collect.bind(idAggregator, null).should.throw(TypeError, 'Log object has no id');
			collect.bind(idAggregator, 0).should.throw(TypeError, 'Log object has no id');
			collect.bind(idAggregator, false).should.throw(TypeError, 'Log object has no id');
			collect.bind(idAggregator, {}).should.throw(TypeError, 'Log object has no id');
		});

		it('should throw TypeError, if log object argument without id property', function () {
			idAggregator.collect.bind(idAggregator, {test: 'test'}).should.throw(TypeError, 'Log object has no id');
		});
	});

	describe('#flush', function () {
		beforeEach(function () {
			idAggregator.collect(logObjects.l1);
			idAggregator.collect(logObjects.l1a);
			idAggregator.collect(logObjects.l2);
		});

		it('should throw error if flush id is not collected before', function () {
			var spy = chai.spy();
			idAggregator.flush(123, spy);
			spy.should.have.not.been.called();
		});

		it('should throw TypeError, if some empty arguments', function () {
			var flush = idAggregator.flush;
			var reg   = /^cb is not a function.*/;
			flush.bind(idAggregator, 0, 0).should.throw(TypeError, reg);
			flush.bind(idAggregator, '', '').should.throw(TypeError, reg);
			flush.bind(idAggregator, null, null).should.throw(TypeError, reg);
			flush.bind(idAggregator, {}, {}).should.throw(TypeError, reg);
		});

		it('should call callback once on flush, if only one object with flush-id passed to collect', function () {
			var spy = chai.spy();
			idAggregator.flush(logObjects.l2.id, spy);
			spy.should.have.been.called.once.with(logObjects.l2);
		});

		it('should throw error, if flush id is not collected before', function () {
			var spy = chai.spy();
			idAggregator.flush(123, spy);
			spy.should.have.not.been.called();
		});
	});
});
