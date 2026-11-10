// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: x0 => new Int16Array(x0),
      AC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      AD: x0 => x0.clientX,
      AE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      AF: x0 => x0.touches,
      AG: x0 => x0.current(),
      AH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      AI: (a, s, e) => a.slice(s, e),
      AJ: (x0,x1,x2) => new ImageData(x0,x1,x2),
      AK: (x0,x1) => { x0.ondragenter = x1 },
      B: s => printToConsole(s),
      BB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      BE: x0 => x0.matches,
      BF: x0 => x0.pressure,
      BG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      BH: x0 => x0.value,
      BI: o => o.byteLength,
      BJ: (x0,x1) => x0.getContext(x1),
      BK: (x0,x1) => { x0.ondrop = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Uint16Array(x0),
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: x0 => x0.getBoundingClientRect(),
      CE: (x0,x1) => x0.matchMedia(x1),
      CF: x0 => x0.tiltY,
      CG: x0 => x0.v8BreakIterator,
      CH: x0 => x0.selectionDirection,
      CI: () => new FileReader(),
      CJ: (x0,x1) => new OffscreenCanvas(x0,x1),
      CK: x0 => x0.webkitGetAsEntry(),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      DE: x0 => x0.matches,
      DF: x0 => x0.tiltX,
      DG: () => globalThis.Intl,
      DH: x0 => x0.selectionStart,
      DI: (x0,x1) => x0.readAsArrayBuffer(x1),
      DJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      DK: x0 => x0.createReader(),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      EC: (x0,x1) => x0.item(x1),
      ED: s => new Date(s * 1000).getTimezoneOffset() * 60,
      EE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      EF: x0 => x0.pointerType,
      EG: (x0,x1) => x0.segment(x1),
      EH: x0 => x0.selectionEnd,
      EI: x0 => x0.result,
      EJ: x0 => x0.id,
      EK: () => new Blob(),
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: Date.now,
      FE: f => f.dartFunction,
      FF: x0 => x0.pointerId,
      FG: x0 => x0.index,
      FH: x0 => x0.value,
      FI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FJ: x0 => x0.offsetHeight,
      FK: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: (handle) => clearTimeout(handle),
      GE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GF: x0 => x0.getCoalescedEvents(),
      GG: x0 => x0.next(),
      GH: x0 => x0.selectionDirection,
      GI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      GJ: x0 => x0.offsetWidth,
      GK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: (x0,x1) => x0.closest(x1),
      HE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      HF: (x0,x1) => x0.getModifierState(x1),
      HG: x0 => x0.value,
      HH: x0 => x0.selectionStart,
      HI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      HJ: x0 => x0.stopPropagation(),
      HK: (x0,x1) => x0.file(x1),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: x0 => x0.bottom,
      IE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      IF: s => s.trimLeft(),
      IG: x0 => x0.done,
      IH: x0 => x0.selectionEnd,
      II: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IJ: x0 => x0.disabled,
      IK: x0 => x0.fullPath,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: x0 => x0.top,
      JE: (o, i) => o[i],
      JF: (x0,x1) => x0[x1],
      JG: (o, m, a) => o[m].apply(o, a),
      JH: x0 => x0.keyCode,
      JI: () => new XMLHttpRequest(),
      JJ: (x0,x1) => { x0.min = x1 },
      JK: x0 => x0.name,
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: x0 => x0.right,
      KE: o => o.length,
      KF: x0 => x0.index,
      KG: x0 => x0.iterator,
      KH: (x0,x1) => x0.scrollIntoView(x1),
      KI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      KJ: (x0,x1) => { x0.max = x1 },
      KK: (a, l) => a.length = l,
      L: o => o === undefined,
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: x0 => x0.left,
      LE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      LF: (x0,x1) => x0.exec(x1),
      LG: () => globalThis.Symbol,
      LH: x0 => x0.multiViewEnabled,
      LI: x0 => x0.send(),
      LJ: (x0,x1) => { x0.disabled = x1 },
      LK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      M: o => String(o),
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: x0 => x0.clientY,
      ME: x0 => x0.language,
      MF: s => s.toUpperCase(),
      MG: (x0,x1) => new Intl.Segmenter(x0,x1),
      MH: (x0,x1) => x0.replaceWith(x1),
      MI: x0 => x0.type,
      MJ: (x0,x1) => { x0.scrollLeft = x1 },
      MK: (x0,x1) => x0.readEntries(x1),
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: x0 => x0.clientX,
      NE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      NF: x0 => x0.length,
      NG: x0 => x0.Segmenter,
      NH: (x0,x1) => { x0.type = x1 },
      NI: x0 => x0.response,
      NJ: (x0,x1) => { x0.spellcheck = x1 },
      NK: x0 => x0.isDirectory,
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: x0 => x0.changedTouches,
      OE: () => globalThis.window.FinalizationRegistry,
      OF: x0 => x0.flags,
      OG: x0 => x0.buffer,
      OH: (x0,x1) => { x0.className = x1 },
      OI: (x0,x1) => { x0.responseType = x1 },
      OJ: (x0,x1) => { x0.disabled = x1 },
      OK: (x0,x1) => x0[x1],
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: x0 => x0.offsetY,
      PE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PF: (a, s) => a.join(s),
      PG: x0 => x0.wasmMemory,
      PH: (x0,x1) => { x0.tabIndex = x1 },
      PI: x0 => x0.vendor,
      PJ: (x0,x1) => x0.getContext(x1),
      PK: x0 => x0.length,
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: x0 => x0.offsetX,
      QE: x0 => new window.FinalizationRegistry(x0),
      QF: (x0,x1) => x0.error(x1),
      QG: () => globalThis.window._flutter_skwasmInstance,
      QH: (x0,x1) => { x0.name = x1 },
      QI: x0 => x0.navigator,
      QJ: (x0,x1) => { x0.height = x1 },
      QK: x0 => x0.items,
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: x0 => x0.type,
      RE: (x0,x1) => x0.unregister(x1),
      RF: () => globalThis.console,
      RG: () => new TextDecoder(),
      RH: (x0,x1) => { x0.placeholder = x1 },
      RI: x0 => ({type: x0}),
      RJ: (x0,x1) => { x0.width = x1 },
      RK: x0 => x0.dataTransfer,
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: x0 => x0.maxTouchPoints,
      SE: (x0,x1) => x0.contains(x1),
      SF: s => s.trimRight(),
      SG: (a, i) => a.splice(i, 1),
      SH: (x0,x1) => { x0.autocomplete = x1 },
      SI: (x0,x1) => new Blob(x0,x1),
      SJ: x0 => x0.canvasKitMaximumSurfaces,
      SK: x0 => x0.length,
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: x0 => x0.platform,
      TE: (s) => +s,
      TF: x0 => x0.blur(),
      TG: a => a.pop(),
      TH: (x0,x1) => { x0.name = x1 },
      TI: x0 => x0.pop(),
      TJ: x0 => x0.hostElement,
      TK: x0 => x0.getReader(),
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (string, token) => string.split(token),
      UD: x0 => x0.body,
      UE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      UF: x0 => x0.button,
      UG: (map, o, v) => map.set(o, v),
      UH: (x0,x1) => { x0.placeholder = x1 },
      UI: x0 => globalThis.URL.createObjectURL(x0),
      UJ: x0 => x0.location,
      UK: x0 => x0.value,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: o => o instanceof Array,
      VD: () => globalThis.document,
      VE: s => s.trim(),
      VF: x0 => x0.innerHeight,
      VG: (map, o) => map.get(o),
      VH: (x0,x1) => { x0.action = x1 },
      VI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      VJ: (x0,x1) => x0.getModifierState(x1),
      VK: x0 => x0.done,
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (a, i) => a[i],
      WD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      WE: x0 => x0.classList,
      WF: x0 => x0.innerWidth,
      WG: () => new WeakMap(),
      WH: (x0,x1) => { x0.method = x1 },
      WI: x0 => x0.debugSkipFontRetryDelay,
      WJ: x0 => x0.metaKey,
      WK: x0 => x0.read(),
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: a => a.length,
      XD: x0 => x0.hasFocus(),
      XE: x0 => x0.preventDefault(),
      XF: x0 => x0.height,
      XG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      XH: (x0,x1) => { x0.noValidate = x1 },
      XI: (x0,x1,x2) => x0.set(x1,x2),
      XJ: x0 => x0.altKey,
      XK: x0 => x0.body,
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: (x0,x1) => x0.test(x1),
      YD: x0 => x0.relatedTarget,
      YE: x0 => x0.parent,
      YF: x0 => x0.width,
      YG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      YH: (x0,x1) => x0.removeAttribute(x1),
      YI: x0 => x0.fontFallbackBaseUrl,
      YJ: x0 => x0.ctrlKey,
      YK: x0 => x0.assetBase,
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: x0 => x0.userAgent,
      ZD: x0 => x0.shiftKey,
      ZE: x0 => x0.timeStamp,
      ZF: x0 => x0.clientHeight,
      ZG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      ZH: x0 => x0.isConnected,
      ZI: x0 => x0.ready,
      ZJ: x0 => x0.isComposing,
      ZK: x0 => x0.loader,
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.navigator,
      aD: (decoder, codeUnits) => decoder.decode(codeUnits),
      aE: (x0,x1) => x0.hasAttribute(x1),
      aF: x0 => x0.clientWidth,
      aG: x0 => x0.history,
      aH: x0 => x0.click(),
      aI: x0 => x0.fonts,
      aJ: x0 => x0.code,
      aK: () => globalThis._flutter,
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: Function.prototype.call.bind(String.prototype.toLowerCase),
      bD: () => new TextDecoder("utf-8", {fatal: true}),
      bE: x0 => x0.buttons,
      bF: (x0,x1) => { x0.content = x1 },
      bG: x0 => x0.search,
      bH: (x0,x1) => x0.getElementsByClassName(x1),
      bI: () => globalThis.document,
      bJ: x0 => x0.repeat,
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: Object.is,
      cD: () => new TextDecoder("utf-8", {fatal: false}),
      cE: x0 => x0.ctrlKey,
      cF: (x0,x1) => { x0.name = x1 },
      cG: x0 => x0.location,
      cH: (x0,x1) => x0.dispatchEvent(x1),
      cI: (handle) => clearInterval(handle),
      cJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.vendor,
      dD: (a, i, v) => a[i] = v,
      dE: x0 => x0.y,
      dF: x0 => x0.head,
      dG: x0 => x0.pathname,
      dH: (x0,x1) => x0.createEvent(x1),
      dI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      dJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (x0,x1) => x0.createTextNode(x1),
      eD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      eE: x0 => x0.x,
      eF: (x0,x1) => x0.removeChild(x1),
      eG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      eH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      eI: () => Date.now(),
      eJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: (x0,x1) => { x0.id = x1 },
      fD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      fE: x0 => x0.scrollTop,
      fF: x0 => x0.firstChild,
      fG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      fH: x0 => x0.readText(),
      fI: (x0,x1) => x0.appendChild(x1),
      fJ: x0 => x0.message,
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (x0,x1) => { x0.nonce = x1 },
      gD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      gE: x0 => x0.offsetTop,
      gF: x0 => x0.viewConstraints,
      gG: o => Object.keys(o),
      gH: x0 => x0.clipboard,
      gI: x0 => x0.click(),
      gJ: x0 => x0.lastModified,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: x0 => x0.nonce,
      hD: x0 => x0.visibilityState,
      hE: x0 => x0.scrollLeft,
      hF: x0 => x0.hostElement,
      hG: x0 => x0.state,
      hH: (x0,x1) => x0.writeText(x1),
      hI: x0 => x0.remove(),
      hJ: x0 => x0.size,
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: () => globalThis.window.flutterConfiguration,
      iD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      iE: x0 => x0.offsetLeft,
      iF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iG: x0 => x0.hash,
      iH: x0 => x0.unlock(),
      iI: x0 => globalThis.URL.revokeObjectURL(x0),
      iJ: x0 => x0.name,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: (x0,x1) => x0.attachShadow(x1),
      jD: x0 => x0.disconnect(),
      jE: x0 => x0.offsetParent,
      jF: x0 => ({runApp: x0}),
      jG: x0 => x0.state,
      jH: (x0,x1) => x0.lock(x1),
      jI: x0 => x0.body,
      jJ: x0 => x0.type,
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: (x0,x1) => x0.createElement(x1),
      kD: x0 => new Intl.Locale(x0),
      kE: (o, p, r) => o.replace(p, () => r),
      kF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      kG: (x0,x1) => x0.go(x1),
      kH: x0 => x0.orientation,
      kI: (x0,x1) => { x0.display = x1 },
      kJ: (x0,x1) => x0.item(x1),
      l: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      lC: x0 => x0.scale,
      lD: x0 => x0.region,
      lE: (x0,x1) => { x0.lastIndex = x1 },
      lF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      lG: x0 => x0.parentElement,
      lH: (x0,x1) => x0.querySelector(x1),
      lI: x0 => x0.style,
      lJ: x0 => x0.length,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: x0 => x0.visualViewport,
      mD: x0 => x0.script,
      mE: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: (x0,x1) => x0.querySelectorAll(x1),
      mH: (x0,x1) => { x0.title = x1 },
      mI: (x0,x1) => { x0.download = x1 },
      mJ: x0 => x0.files,
      n: (x0,x1) => x0.prepend(x1),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.devicePixelRatio,
      nD: x0 => x0.language,
      nE: o => o instanceof RegExp,
      nF: () => typeof dartUseDateNowForTicks !== "undefined",
      nG: (d, digits) => d.toFixed(digits),
      nH: (x0,x1) => x0.vibrate(x1),
      nI: (x0,x1) => { x0.href = x1 },
      nJ: (x0,x1) => { x0.multiple = x1 },
      o: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: x0 => x0.height,
      oD: x0 => x0.languages,
      oE: x0 => x0.dotAll,
      oF: () => Date.now(),
      oG: x0 => x0.maxHeight,
      oH: x0 => x0.arrayBuffer(),
      oI: (x0,x1) => x0.createElement(x1),
      oJ: (x0,x1) => { x0.accept = x1 },
      p: b => !!b,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: x0 => x0.width,
      pD: (x0,x1) => x0.observe(x1),
      pE: x0 => x0.unicode,
      pF: () => 1000 * performance.now(),
      pG: x0 => x0.maxWidth,
      pH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      pI: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      pJ: (x0,x1) => { x0.type = x1 },
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: x0 => x0.screen,
      qD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      qE: x0 => x0.ignoreCase,
      qF: (x0,x1) => x0.requestAnimationFrame(x1),
      qG: x0 => x0.minHeight,
      qH: x0 => x0.status,
      qI: x0 => x0.arrayBuffer(),
      qJ: (x0,x1) => x0.querySelector(x1),
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: (string, times) => string.repeat(times),
      rD: x0 => new ResizeObserver(x0),
      rE: x0 => x0.multiline,
      rF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      rG: x0 => x0.minWidth,
      rH: (x0,x1) => x0.fetch(x1),
      rI: (x0,x1) => x0.transferFromImageBitmap(x1),
      rJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      sD: (x0,x1) => x0.getPropertyValue(x1),
      sE: (o, p, r) => o.replaceAll(p, () => r),
      sF: x0 => x0.now(),
      sG: (x0,x1) => x0.removeProperty(x1),
      sH: x0 => x0.content,
      sI: x0 => x0.height,
      sJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: x0 => x0.tabIndex,
      tD: x0 => globalThis.parseFloat(x0),
      tE: x0 => x0.deltaMode,
      tF: x0 => x0.performance,
      tG: (x0,x1) => x0.add(x1),
      tH: x0 => x0.document,
      tI: x0 => x0.width,
      tJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.contains(x1),
      uD: (x0,x1) => x0.getComputedStyle(x1),
      uE: x0 => x0.deltaY,
      uF: x0 => new Uint8Array(x0),
      uG: x0 => x0.data,
      uH: x0 => new WeakRef(x0),
      uI: x0 => x0.rasterEndMilliseconds,
      uJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.activeElement,
      vD: x0 => x0.documentElement,
      vE: x0 => x0.deltaX,
      vF: (x0,x1,x2) => x0.slice(x1,x2),
      vG: (x0,x1) => { x0.scrollTop = x1 },
      vH: x0 => x0.deref(),
      vI: x0 => x0.rasterStartMilliseconds,
      vJ: (x0,x1) => { x0.ondragleave = x1 },
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.parentNode,
      wD: x0 => x0.computedStyleMap(),
      wE: x0 => x0.wheelDeltaY,
      wF: (x0,x1) => x0.decode(x1),
      wG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      wH: () => globalThis.WeakRef,
      wI: x0 => x0.imageBitmaps,
      wJ: x0 => x0.preventDefault(),
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.tagName,
      xD: (x0,x1) => x0.get(x1),
      xE: x0 => x0.wheelDeltaX,
      xF: (x0,x1) => x0.adoptText(x1),
      xG: (x0,x1) => { x0.value = x1 },
      xH: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      xI: (x0,x1) => { x0.height = x1 },
      xJ: x0 => x0.clientY,
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.target,
      yD: (o, p) => p in o,
      yE: x0 => x0.key,
      yF: x0 => x0.first(),
      yG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      yH: () => globalThis.window,
      yI: (x0,x1) => { x0.width = x1 },
      yJ: x0 => x0.clientX,
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.clientY,
      zD: (x0,x1) => { x0.textContent = x1 },
      zE: x0 => x0.identifier,
      zF: x0 => x0.next(),
      zG: (x0,x1) => { x0.value = x1 },
      zH: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      zI: x0 => x0.convertToBlob(),
      zJ: (x0,x1) => { x0.ondragover = x1 },

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
