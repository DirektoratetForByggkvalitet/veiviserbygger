// polyfill for Buffer in browser environment
import { Buffer as BufferPolyfill } from 'buffer'
globalThis.Buffer = BufferPolyfill
