# Super Error

Easily subclass errors.

```
npm install super-error
```

## Simple Subclassing

SuperError can easily be subclassed using the `subclass` method. Class
hierarchies can be created by using the `subclass` method on other
subclasses.

Error instances can be tested with the `instanceof` operator how you'd
expect. They also have `stack`, `name` and `message` properties, as
you'd expect.

```javascript
var SuperError = require('super-error');

var MyError = SuperError.subclass('MyError');
var MySpecificError = MyError.subclass('MySpecificError');

var err = new MySpecificError('my message');

err instanceof MySpecificError; //=> true
err instanceof MyError;         //=> true
err instanceof SuperError;      //=> true
err instanceof Error;           //=> true

throw err;
```

The default SuperError constructor also accepts a plain object of
properties to assign on the error.

```javascript
var err = new MySpecificError('my message', {code: 404});
// Or, equivalently:
var err = new MySpecificError({message: 'my message', code: 404});

err.message; //=> 'my message'
err.code;    //=> 404
```

## Custom Constructors

A custom constructor can be passed to `subclass`, which will hide
all super constructors. If you want to propagate arguments
to the parent constructor, call it explicitly.

```javascript
var SuperError = require('super-error');

var ERROR_CODES = {
  1: 'Invalid foo',
  2: 'Invalid bar',
  3: 'Invalid baz'
};

var MyCodeError = SuperError.subclass('MyCodeError', function(code) {
  this.code = code;
  this.message = ERROR_CODES[code];
});

var err = new MyCodeError(2);

err.code;    //=> 2
err.message; //=> 'Invalid bar'

throw err;

var MyCustomError = SuperError.subclass('MyCustomError', function(message, properties) {
  SuperError.call(this, 'Decorated ' + message, properties);
});
```

## Exporting Error Classes

An `exports` object can be passed to `subclass` in order to
automatically export the error class. This prevents repeating the class
name more than twice and simplifies a common pattern.

```javascript
var SuperError = require('super-error');

var MyError = SuperError.subclass(exports, 'MyError');
var MySpecificError = MyError.subclass(exports, 'MySpecificError');

exports.MyError === MyError;                 //=> true
exports.MySpecificError === MySpecificError; //=> true
```

## Error Causes

SuperError instances can wrap other Error or SuperError instances as
their `cause`.  This allows for higher-level error matching and handling
at the top of a call stack without losing any information about the
original specific cause.

Causes are set using `causedBy` on a SuperError instance. The instance
is returned from the method for ease of use with `throw` or callbacks.

```javascript
var SuperError = require('super-error');

var MyParseError = SuperError.subclass('MyParseError');

try {
  var obj = JSON.parse('"foo');
} catch (e) {
  throw new MyParseError('failed to parse').causedBy(e);
}
```

The cause is saved on the `cause` property of the SuperError instance,
and the stack traces are concatenated. The original stack trace can be
accessed through the `ownStack` property.

```
MyParseError: failed to parse
    at Object.<anonymous> (example.js:8:9)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:906:3
Cause: SyntaxError: Unexpected end of input
    at Object.parse (native)
    at Object.<anonymous> (example.js:6:18)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)
    at Module.load (module.js:356:32)
    at Function.Module._load (module.js:312:12)
    at Function.Module.runMain (module.js:497:10)
    at startup (node.js:119:16)
    at node.js:906:3
```

In a chain of nested wrapped errors, the original unwrapped cause can be
accessed through the `rootCause` property of each SuperError instance in
the chain.

```javascript
var SuperError = require('super-error');

var WrappedError = SuperError.subclass('WrappedError');
var TopError = SuperError.subclass('TopError');

var cause = new Error('cause');
var wrapped = new WrappedError('wrapped').causedBy(cause);
var top = new TopError('top').causedBy(wrapped);

top.cause.message;     //=> 'wrapped'
top.rootCause.message; //=> 'cause'
```
