var util = require('util');

function SuperError(message, properties) {
  if (!(this instanceof Error)) {
    throw new TypeError('SuperError called without new');
  }

  this.name = this.constructor._name || this.constructor.name;

  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

  if (typeof message === 'string') {
    this.message = message;
  } else if (typeof message === 'object' && properties === undefined) {
    properties = message;
  }

  if (typeof properties === 'object') {
    for (var prop in properties) {
      if (properties.hasOwnProperty(prop)) this[prop] = properties[prop];
    }
  }
}
util.inherits(SuperError, Error);

SuperError.subclass = function(exports, name, subclass_constructor) {
  if (typeof name === 'function') {
    subclass_constructor = name;
    name = null;
  }
  if (typeof exports === 'string') {
    name = exports;
    exports = null;
  }

  if (exports && typeof exports !== 'object') {
    throw new TypeError('exports is not an object');
  }
  if (typeof name !== 'string') {
    throw new TypeError('name is not a string');
  }
  if (subclass_constructor && typeof subclass_constructor !== 'function') {
    throw new TypeError('subclass_constructor is not a function');
  }

  var super_constructor = this;

  var constructor = function() {
    super_constructor.apply(this, arguments);
    if (subclass_constructor) {
      subclass_constructor.apply(this, arguments);
    }
  };

  constructor._name = name;

  util.inherits(constructor, super_constructor);
  constructor.subclass = super_constructor.subclass;

  if (exports) {
    exports[name] = constructor;
  }

  return constructor;
};

SuperError.prototype.causedBy = function(cause) {
  if (!(cause instanceof Error)) {
    throw new TypeError('causedBy called without Error instance');
  }

  this.cause = cause;
  if (cause.rootCause instanceof Error) {
    this.rootCause = cause.rootCause;
  } else {
    this.rootCause = cause;
  }

  this.ownStack = this.stack;
  this.stack += '\nCause: ' + cause.stack;

  return this;
};

module.exports = SuperError;
