var chai   = require('chai');
var spies  = require('chai-spies');
var should = chai.should();
var logObjects = require('./fixtures/logObjects');

chai.use(spies);

module.exports = {
	chai: chai,
	fixtures: logObjects
};
