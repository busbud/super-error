var util   = require('util');
var assert = require('assert');

function SuperError(message) {
  if (!(this instanceof Error)) {
    throw new TypeError('SuperError called without new');
  }

  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor._name || this.constructor.name;
  this.message = message;
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

module.exports = SuperError;
