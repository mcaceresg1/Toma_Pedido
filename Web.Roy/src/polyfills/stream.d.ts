/**
 * Declaración de tipos para el módulo 'stream'
 * Esto ayuda a TypeScript y Vite a resolver correctamente el polyfill
 */
declare module 'stream' {
  class StreamStub {
    constructor();
  }
  
  export class Readable extends StreamStub {}
  export class Writable extends StreamStub {}
  export class Duplex extends StreamStub {}
  export class Transform extends StreamStub {}
  export class PassThrough extends StreamStub {}
  export class Stream extends StreamStub {}
  
  export default {
    Readable: Readable,
    Writable: Writable,
    Duplex: Duplex,
    Transform: Transform,
    PassThrough: PassThrough,
    Stream: Stream,
  };
}

