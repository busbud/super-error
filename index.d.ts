declare namespace SuperError {
  interface SuperErrorI {
    name: string;
    message: string;
    [k: string]: any;
  
    new(...args: any[]): SuperError;
  }
}

interface SuperError extends Error {
  name: string;
  message: string;
  [k: string]: any;

  static subclass(name: string): SuperErrorI;
  static subclass(exports: any, name: string): SuperErrorI;
  static subclass(exports: any, name: string, subclass_constructor: (this: SuperError, ...args: any[]) => void): SuperErrorI;
  static subclass(name: string, subclass_constructor: (this: SuperError, ...args: any[]) => void): SuperErrorI;

  constructor(...args: any[]);
  causedBy(err: Error): this;
}

declare var SuperError: SuperError;
export = SuperError;
