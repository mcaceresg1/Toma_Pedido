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

// Definir en window para acceso global (lo más temprano posible)
if (typeof window !== 'undefined') {
  (window as any).stream = streamPolyfill;
  // También definir directamente en window para acceso inmediato
  (window as any).Stream = StreamStub;
}

// Definir en globalThis para compatibilidad
if (typeof globalThis !== 'undefined') {
  (globalThis as any).stream = streamPolyfill;
  (globalThis as any).Stream = StreamStub;
}

// Intentar definir en el objeto global si existe (para Node.js environments simulados)
try {
  const g = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
  if (g.global) {
    g.global.stream = streamPolyfill;
  }
} catch (e) {
  // Ignorar si global no está disponible
}

// Exportar como módulo ES (esto resuelve el import de xlsx-js-style)
export default streamPolyfill;
export const stream = streamPolyfill;

// También exportar Readable directamente para acceso más fácil
export const Readable = StreamStub;
export const Writable = StreamStub;
export const Duplex = StreamStub;
export const Transform = StreamStub;
export const PassThrough = StreamStub;
export const Stream = StreamStub;

