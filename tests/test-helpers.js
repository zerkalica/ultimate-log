var chai   = require('chai');
var should = chai.should();
var sinon  = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var logObjects = require('./fixtures/logObjects');

module.exports = {
	chai: chai,
	spy: sinon.spy,
	fixtures: logObjects
};
