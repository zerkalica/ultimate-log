'use strict';
var proto;

function isObject(val) {
	return (typeof val === 'object');
}

function isString(val) {
	return (Object.prototype.toString.call(val) === '[object String]');
}

function isArray(val) {
	return Array.isArray(val);
}

function mapString(string, map) {
	var result = string;
	for (var name in map) {
		var i = result.indexOf(name);
		if (i !== -1) {
			var value = map[name];
			result = result.substring(0, i) + value + result.substring(i + name.length);
		}
	}

	return result;
}

function deepFreeze (o) {
	var prop, propKey;
	Object.freeze(o); // First freeze the object.
	for (propKey in o) {
		prop = o[propKey];
		if (o.hasOwnProperty(propKey) && prop instanceof Object && !Object.isFrozen(prop)) {
			deepFreeze(prop);
		}
	}
}

var ServiceRecursiveCallException = function (serviceName) {
	this.name = 'ServiceRecursiveCallException';
	this.message = 'Recursive dependencies with ' + serviceName + ' service';
};
proto = ServiceRecursiveCallException.prototype;
proto = new Error();
proto.constructor = ServiceRecursiveCallException;

var ServiceNotConfiguredException = function (serviceName) {
	this.name = 'ServiceNotConfiguredException';
	this.message = 'Service ' + serviceName + ' is not cofigured';
};
proto = ServiceNotConfiguredException.prototype;
proto = new Error();
proto.constructor = ServiceNotConfiguredException;

var MicroDi = function (config) {
	this.name = 'MicroDi';
	this.services = {};
	this.buildLocks = {};
	this.mapVariables = {};
	this.config = config;
	deepFreeze(this.config);
};

proto = MicroDi.prototype;

proto.convertPropertyStringValue = function(configValue) {
	var serviceName,
		value,
		isService = configValue.indexOf('@') === 0;

	if (isService) {
		serviceName = configValue.substring(1);
		value       = this.get(serviceName);
	} else {
		value = this.explainString(configValue);
	}

	return value;
};

proto.convertPropertyValue = function (configValue) {
	var result;

	if (isString(configValue)) {
		result = this.convertPropertyStringValue(configValue);
	} else if (isArray(configValue)) {
		result = configValue.map(this.convertPropertyValue.bind(this));
	} else if (isObject(configValue)) {
		result = {};
		for (var propName in configValue) {
			result[propName] = this.convertPropertyValue(configValue[propName]);
		}
	} else {
		//console.warn('Strange value ', configValue);
		result = configValue;
	}

	return result;
};

proto.convertArgs = function(params) {
	var args = {};
	for (var propertyName in params) {
		var configValue = params[propertyName];
		args[propertyName] = this.convertPropertyValue(configValue);
	}

	return args;
};

proto.explainString = function (string) {
	return mapString(string, this.mapVariables);
};

proto.loadConstructor = function (service, params) {
	return new service(this.convertArgs(params));
};

proto.loadMethods = function (service, params) {
	for (var methodName in params) {
		service[methodName].call(service, this.convertArgs(params[methodName]));
	}

	return service;
};

proto.loadProperties = function (service, params) {
	for (var propertyName in params) {
		service[propertyName] = this.convertArgs(params[propertyName]);
	}

	return service;
};

proto.loadModule = function (path) {
	return require(path);
};

proto.buildService = function(serviceName, params) {
	var service;

	if (!params.require) {
		throw new ServiceNotConfiguredException(serviceName);
	}

	service = this.loadModule(this.explainString(params.require));
	if (params.options) {
		service = this.loadConstructor(service, params.options);
	}

	if (params.properties) {
		service = this.loadProperties(service, params.properties);
	}

	if (params.methods) {
		service = this.loadMethods(service, params.methods);
	}

	return service;
};

proto.get = function(serviceName) {
	var service, params;
	if (this.services[serviceName]) {
		service = this.services[serviceName];
	} else {
		if (this.buildLocks[serviceName]) {
			throw new ServiceRecursiveCallException(serviceName);
		}
		if (!this.config[serviceName]) {
			throw new ServiceNotConfiguredException(serviceName);
		}
		params = this.config[serviceName];

		this.buildLocks[serviceName] = true;
		service = this.buildService(serviceName, params);
		this.buildLocks[serviceName] = false;
	}

	return service;
};

proto.setVariables = function (variables) {
	var mapVariables = {};

	for (var ns in variables) {
		mapVariables['%' + ns + '%'] = variables[ns];
	}
	this.mapVariables = mapVariables;

	return this;
};

module.exports = MicroDi;
