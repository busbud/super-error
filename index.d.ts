declare namespace SuperError {
  interface SuperErrorI {
    name: string;
    message: string;
    [k: string]: any;

    new(...args: any[]): SuperError;
  }
}

declare class SuperError extends Error {
  constructor(...args: any[]);

  name: string;
  message: string;
  cause?: Error;
  rootCause?: Error;
  [k: string]: any;

  subclass(name: string): SuperError.SuperErrorI;
  subclass(exports: any, name: string): SuperError.SuperErrorI;
  subclass(exports: any, name: string, subclass_constructor: (this: SuperError, ...args: any[]) => void): SuperError.SuperErrorI;
  subclass(name: string, subclass_constructor: (this: SuperError, ...args: any[]) => void): SuperError.SuperErrorI;

  causedBy(err: Error): this;
}

export = SuperError;
