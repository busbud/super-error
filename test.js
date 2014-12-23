var assert = require('assert');

var SuperError = require('./index');

var err;

// SuperError constructor

assert.throws(function() {
  SuperError('message');
}, TypeError);

err = new SuperError('message');
assert(err instanceof Error);
assert(err instanceof SuperError);
assert.equal(typeof err.stack, 'string');
assert.equal(err.name, 'SuperError');
assert.equal(err.message, 'message');

err = new SuperError('message', {
  one: 1,
  two: 2
});
assert(err instanceof SuperError);
assert.equal(err.message, 'message');
assert.equal(err.one, 1);
assert.equal(err.two, 2);

// SuperError.subclass

assert.throws(function() {
  SuperError.subclass();
}, TypeError);
assert.throws(function() {
  SuperError.subclass(1, 'name');
}, TypeError);
assert.throws(function() {
  SuperError.subclass({}, 'name', 'constructor');
}, TypeError);

var SimpleError = SuperError.subclass('SimpleError');
assert.equal(typeof SimpleError, 'function');

assert.throws(function() {
  SimpleError('message');
}, TypeError);

err = new SimpleError('message');
assert(err instanceof Error);
assert(err instanceof SuperError);
assert(err instanceof SimpleError);
assert.equal(typeof err.stack, 'string');
assert.equal(err.name, 'SimpleError');
assert.equal(err.message, 'message');

var ExportedError = SuperError.subclass(exports, 'ExportedError');
assert.equal(typeof ExportedError, 'function');
assert.equal(exports.ExportedError, ExportedError);

var ComplexError = SuperError.subclass('ComplexError', function(code, message) {
  this.code = code;
  this.message = code + message;
});
assert.equal(typeof ComplexError, 'function');

err = new ComplexError(42, 'message');
assert(err instanceof Error);
assert(err instanceof SuperError);
assert(err instanceof ComplexError);
assert.equal(typeof err.stack, 'string');
assert.equal(err.name, 'ComplexError');
assert.equal(err.code, 42);
assert.equal(err.message, '42message');

var ExportedComplexError = SuperError.subclass(
  exports,
  'ExportedComplexError',
  function(code, message) {
    this.code = code;
    this.message = code + message;
  }
);
assert.equal(typeof ExportedComplexError, 'function');
assert.equal(exports.ExportedComplexError, ExportedComplexError);

err = new ExportedComplexError(42, 'message');
assert.equal(err.code, 42);
assert.equal(err.message, '42message');

// SuperError.subclass(...).subclass

var ParentError = SuperError.subclass('ParentError', function() {
  this.parent_test = 'test';
});
var ChildError = ParentError.subclass('ChildError', function() {
  this.child_test = 'test';
});
assert.equal(typeof ChildError, 'function');

err = new ChildError('message');
assert(err instanceof Error);
assert(err instanceof SuperError);
assert(err instanceof ParentError);
assert(err instanceof ChildError);
assert.equal(err.message, 'message');
assert.equal(err.parent_test, 'test');
assert.equal(err.child_test, 'test');
