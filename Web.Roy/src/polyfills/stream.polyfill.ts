/**
 * Polyfill para el módulo 'stream' de Node.js
 * Necesario para xlsx-js-style que intenta usar APIs de Node.js en el navegador
 * Este polyfill proporciona stubs vacíos para evitar errores de Vite/Angular
 */

// Crear clases stub vacías que no hacen nada
class StreamStub {
  constructor() {}
}

// Crear el objeto stream con todas las clases necesarias
const streamPolyfill = {
  Readable: StreamStub,
  Writable: StreamStub,
  Duplex: StreamStub,
  Transform: StreamStub,
  PassThrough: StreamStub,
  Stream: StreamStub,
};

// Definir en window para acceso global
if (typeof window !== 'undefined') {
  (window as any).stream = streamPolyfill;
}

// Definir en globalThis para compatibilidad
if (typeof globalThis !== 'undefined') {
  (globalThis as any).stream = streamPolyfill;
}

// Exportar como módulo ES (esto resuelve el import de xlsx-js-style)
export default streamPolyfill;
export const stream = streamPolyfill;

