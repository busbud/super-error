var util = require('util');

function BaseConstructor() {
  if (!(this instanceof Error)) {
    throw new TypeError('SuperError called without new');
  }

  if (!this.ownStack) {
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }

    this.ownStack = this.stack;
  }
}

function SuperError(message, properties) {
  BaseConstructor.call(this);

  if (typeof message === 'string') {
    this.message = message;
  } else if (typeof message === 'object' && properties === undefined) {
    properties = message;
  }

  if (typeof properties === 'object') {
    for (var prop in properties) {
      /* eslint-disable no-prototype-builtins */
      if (properties.hasOwnProperty(prop)) this[prop] = properties[prop];
    }
  }
}
util.inherits(SuperError, Error);
SuperError.prototype.name = 'SuperError';

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

  var constructor = createConstructor(name, subclass_constructor, this);

  try {
    Object.defineProperty(constructor, 'name', {
      value: name
    });
  } catch (e) {
    // Do nothing.
  }

  constructor.prototype.name = name;

  if (exports) {
    exports[name] = constructor;
  }

  return constructor;
};

function createConstructor(name, subclass_constructor, super_constructor) {
  var constructor;
  if (subclass_constructor) {
    /*
     * ES6 classes can only be constructed with 'new', so using Function.prototype.apply()
     * fails. They have a non-configurable non-writable 'prototype' property, and it's
     * possible, but unlikely, for this to be set for regular functions (certainly our
     * README doesn't advocate doing this, so it's very unlikely to happen for us).
     */
    if (!Object.getOwnPropertyDescriptor(subclass_constructor, 'prototype').writable) {
      if (!(subclass_constructor.prototype instanceof SuperError)) {
        throw new TypeError('subclass_constructor does not extend SuperError');
      }
      return subclass_constructor;
    }
    constructor = function() {
      BaseConstructor.call(this);
      subclass_constructor.apply(this, arguments);
    };
  } else {
    constructor = function() {
      super_constructor.apply(this, arguments);
    };
  }

  util.inherits(constructor, super_constructor);

  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(constructor, super_constructor);
  } else {
    constructor.subclass = super_constructor.subclass;
  }

  return constructor;
}

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

  this.stack = this.ownStack + '\nCause: ' + cause.stack;

  return this;
};

module.exports = SuperError;
