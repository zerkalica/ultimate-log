var TypeFilter = require('../../lib/filters/type-filter');
var helpers    = require('../test-helpers');
var chai       = helpers.chai;
var logObjects = helpers.fixtures;

describe('filters/type-filter', function () {
	describe('#isValid', function () {
		it ('should throw TypeError, if empty arguments given', function () {
			var typeFilter = new TypeFilter({types: ['info', 'debug']});
			var isValid = typeFilter.isValid;
			isValid.bind(typeFilter).should.throw(TypeError);
			isValid.bind(typeFilter, '').should.throw(TypeError);
			isValid.bind(typeFilter, 0).should.throw(TypeError);
			isValid.bind(typeFilter, null).should.throw(TypeError);
			isValid.bind(typeFilter, false).should.throw(TypeError);
			isValid.bind(typeFilter, []).should.throw(TypeError);
			isValid.bind(typeFilter, {}).should.throw(TypeError);
		});

		it('should filter only info and debug message', function () {
			var typeFilter = new TypeFilter({types: ['info', 'debug']});
			typeFilter.isValid(logObjects.l1).should.to.be.true;
			typeFilter.isValid(logObjects.l2).should.to.be.true;
			typeFilter.isValid(logObjects.l1a).should.to.be.false;
		});
		it('should filter only warn message', function () {
			var typeFilter = new TypeFilter({types: ['warn']});
			typeFilter.isValid(logObjects.l1).should.to.be.false;
			typeFilter.isValid(logObjects.l2).should.to.be.false;
			typeFilter.isValid(logObjects.l1a).should.to.be.true;
		});
	});
});
