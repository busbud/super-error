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

## Custom Constructors

A custom constructor can be passed to `subclass`, which will be called
after all super-constructors.

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
