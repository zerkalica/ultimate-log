var IdAggregator = require('../../lib/aggregators/id-aggregator');
var chai = require('chai');

chai.should();

describe('id-aggregator', function () {
	var idAggregator;
	var testLogObject = {
		id: 1,
		namespace: 'test',
		data: {test: 'test'}
	};
	beforeEach(function () {
		idAggregator = new IdAggregator();
	});

	it ('#collect should add log object and aggregate by id', function () {
		idAggregator.collect(testLogObject);

		idAggregator.logObjects.should.be.an.array;
		//idAggregator.logObjects[testLogObject.id];
	});
});
