/* eslint-env mocha */
const { expect } = require('chai');

const SuperError = require('../');

describe('SuperError', () => {
  context('constructor', () => {
    it('should create an instance of SuperError', () => {
      const err = new SuperError('message');
      expect(err instanceof Error).to.be.true;
      expect(err instanceof SuperError).to.be.true;
      expect(typeof err.stack).to.equal('string');
      expect(err.name).to.equal('SuperError');
      expect(err.message).to.equal('message');
    });

    it('should create an instance of SuperError with additional properties', () => {
      const err = new SuperError('message', {
        one: 1,
        two: 2
      });
      expect(err instanceof SuperError).to.be.true;
      expect(err.message).to.equal('message');
      expect(err.one).to.equal(1);
      expect(err.two).to.equal(2);
    });

    it('should create an instance of SuperError with with additional properties when an object is passed as the first parameter', () => {
      const err = new SuperError({
        message: 'message',
        one: 1,
        two: 2
      });
      expect(err instanceof SuperError).to.be.true;
      expect(err.message).to.equal('message');
      expect(err.one).to.equal(1);
      expect(err.two).to.equal(2);
    });

    it('should throw when used wthout a new constructor', () => {
      let err;
      try {
        SuperError('message');
      } catch (e) {
        err = e;
      }
      expect(err instanceof TypeError).to.be.true;
    });
  });

  context('subclass', () => {
    it('should create a subclass of SuperError', () => {
      const SimpleError = SuperError.subclass('SimpleError');
      expect(typeof SimpleError).to.equal('function');

      const err = new SimpleError('message');
      expect(err instanceof Error).to.be.true;
      expect(err instanceof SuperError).to.be.true;
      expect(err instanceof SimpleError).to.be.true;
      expect(typeof err.stack).to.equal('string');
      expect(err.name).to.equal('SimpleError');
      expect(err.message).to.equal('message');
    });

    it('should create a subclass of SuperError with additional properties', () => {
      const ComplexError = SuperError.subclass('ComplexError', function(code, message) {
        this.code = code;
        this.message = code + message;
      });

      expect(typeof ComplexError).to.equal('function');

      const err = new ComplexError(42, 'message');
      expect(err instanceof Error).to.be.true;
      expect(err instanceof SuperError).to.be.true;
      expect(err instanceof ComplexError).to.be.true;
      expect(typeof err.stack).to.equal('string');
      expect(err.name).to.equal('ComplexError');
      expect(err.code).to.equal(42);
      expect(err.message).to.equal('42message');
    });

    it('should automaticially export a new SuperError subclass', () => {
      const ExportedComplexError = SuperError.subclass(
        exports,
        'ExportedComplexError',
        function(code, message) {
          this.code = code;
          this.message = code + message;
        }
      );
      expect(typeof ExportedComplexError).to.equal('function');
      expect(exports.ExportedComplexError).to.equal(ExportedComplexError);

      const err = new ExportedComplexError(42, 'message');
      expect(err.code).to.equal(42);
      expect(err.message).to.equal('42message');
    });

    it('should accept a class as a SuperError subclass parameter', () => {
      const ClassError = SuperError.subclass('ClassError', class extends SuperError {
        constructor(code, description) {
          super();
          this.code = code;
          this.description = description;
        }

        get message() {
          return this.code + this.description;
        }
      });
      expect(typeof ClassError).to.equal('function');

      const err = new ClassError(42, 'message');
      expect(err instanceof Error).to.be.true;
      expect(err instanceof SuperError).to.be.true;
      expect(err instanceof ClassError).to.be.true;
      expect(typeof err.stack).to.equal('string');
      expect(err.name).to.equal('ClassError');
      expect(err.code).to.equal(42);
      expect(err.description).to.equal('message');
      expect(err.message).to.equal('42message');
    });

    it('should accept an object as a SuperError subclass parameter', () => {
      const ObjectError = SuperError.subclass(
        'ObjectError',
        function(object) {
          this.code = object.statusCode;
          this.message = object.statusText;
        }
      );

      const err = new ObjectError({ statusCode: 418, statusText: 'I\'m a teapot' });
      expect(err.code).to.equal(418);
      expect(err.message).to.equal('I\'m a teapot');
      expect(err.statusCode).to.equal(undefined);
      expect(err.statusText).to.equal(undefined);
    });

    it('should fail when passed no parameters', () => {
      let err;
      try {
        SuperError.subclass();
      } catch (e) {
        err = e;
      }
      expect(err instanceof TypeError).to.be.true;
    });

    it('should fail when incorrect types for parameters', () => {
      let err;
      try {
        SuperError.subclass(1, 'name');
      } catch (e) {
        err = e;
      }
      expect(err instanceof TypeError).to.be.true;

      err = null;
      try {
        SuperError.subclass({}, 'name', 'constructor');
      } catch (e) {
        err = e;
      }
      expect(err instanceof TypeError).to.be.true;
    });
  });

  context('subclass.subclass', () => {
    it('should create a SuperError instance of a subclassed SuperError instance', () => {
      const ParentError = SuperError.subclass('ParentError', function() {
        SuperError.apply(this, arguments);
        this.parent_test = 'test';
      });
      const ChildError = ParentError.subclass('ChildError', function() {
        ParentError.apply(this, arguments);
        this.child_test = 'test';
      });
      expect(typeof ChildError).to.equal('function');

      const err = new ChildError('message');
      expect(err instanceof Error).to.be.true;
      expect(err instanceof SuperError).to.be.true;
      expect(err instanceof ParentError).to.be.true;
      expect(err instanceof ChildError).to.be.true;
      expect(err.message).to.equal('message');
      expect(err.parent_test).to.equal('test');
      expect(err.child_test).to.equal('test');
    });
  });

  context('causedBy', () => {
    it('should merge the class stacks with a normal error passed to causedBy', () => {
      const cause = new Error('cause');
      const err = new SuperError('effect');

      expect(err.causedBy(cause)).to.equal(err);
      expect(err.cause).to.equal(cause);
      expect(err.rootCause).to.equal(cause);
      expect(/Cause:/.test(err.stack)).to.be.true;
      expect(typeof err.ownStack).to.equal('string');
      expect(/Cause:/.test(err.ownStack)).to.be.false;
    });

    it('should merge the class stacks with a SuperError instance passed to causedBy', () => {
      const cause = new Error('cause');
      const intermediate = new SuperError('intermediate').causedBy(cause);
      const err = new SuperError('effect').causedBy(intermediate);

      expect(intermediate.cause).to.equal(cause);
      expect(intermediate.rootCause).to.equal(cause);
      expect(err.cause).to.equal(intermediate);
      expect(err.rootCause).to.equal(cause);
    });

    it('should fail when passing a non error instance to causedBy', () => {
      let err;
      try {
        new SuperError().causedBy('string');
      } catch (e) {
        err = e;
      }
      expect(err instanceof TypeError).to.be.true;
    });
  });
});
