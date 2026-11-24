// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(
      await _compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string'], importedStringConstants: ''};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

let _isCompileStreamingSupported;
async function _compileStreaming(source, builtins) {
  _isCompileStreamingSupported ??= WebAssembly.compileStreaming(
    new Response(
      new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),
      {headers: {'Content-Type': 'application/wasm'}},
    ),
    builtins,
  ).then(() => false, (e) => e instanceof WebAssembly.CompileError);
  if (await _isCompileStreamingSupported) {
    return WebAssembly.compileStreaming(source, builtins);
  }
  return WebAssembly.compile(await (await source).arrayBuffer(), builtins);
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
      AE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AF: x0 => x0.touches,
      AG: (x0,x1) => x0.adoptText(x1),
      AH: x0 => x0.selectionStart,
      AI: o => o.byteLength,
      AJ: x0 => x0.ready,
      AK: x0 => x0.clientY,
      B: s => printToConsole(s),
      BB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      BC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      BD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      BE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      BF: x0 => x0.pressure,
      BG: x0 => x0.first(),
      BH: x0 => x0.selectionEnd,
      BI: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      BJ: x0 => x0.fonts,
      BK: x0 => x0.clientX,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => new Uint16Array(x0),
      CC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      CD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      CE: (o, i) => o[i],
      CF: x0 => x0.tiltY,
      CG: x0 => x0.next(),
      CH: x0 => x0.value,
      CI: () => new FileReader(),
      CJ: (handle) => clearInterval(handle),
      CK: (x0,x1) => { x0.ondragover = x1 },
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: x0 => new Int32Array(x0),
      DC: (x0,x1) => x0.querySelector(x1),
      DD: (x0,x1) => x0.closest(x1),
      DE: o => o.length,
      DF: x0 => x0.tiltX,
      DG: x0 => x0.current(),
      DH: x0 => x0.selectionDirection,
      DI: (x0,x1) => x0.readAsArrayBuffer(x1),
      DJ: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      DK: (x0,x1) => { x0.ondragenter = x1 },
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
      ED: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      EE: o => {
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
      EF: x0 => x0.pointerType,
      EG: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      EH: x0 => x0.selectionStart,
      EI: x0 => x0.result,
      EJ: () => Date.now(),
      EK: (x0,x1) => { x0.ondrop = x1 },
      F: () => new Error().stack,
      FB: x0 => new Uint32Array(x0),
      FC: x0 => x0.length,
      FD: (handle) => clearTimeout(handle),
      FE: x0 => x0.language,
      FF: x0 => x0.pointerId,
      FG: x0 => x0.v8BreakIterator,
      FH: x0 => x0.selectionEnd,
      FI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      FK: x0 => x0.webkitGetAsEntry(),
      G: s => JSON.stringify(s),
      GB: x0 => new Float32Array(x0),
      GC: (x0,x1) => x0.querySelectorAll(x1),
      GD: x0 => x0.maxTouchPoints,
      GE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      GF: x0 => x0.getCoalescedEvents(),
      GG: () => globalThis.Intl,
      GH: (x0,x1) => { x0.name = x1 },
      GI: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      GJ: x0 => x0.id,
      GK: x0 => x0.createReader(),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      HC: (x0,x1) => x0.getAttribute(x1),
      HD: x0 => x0.platform,
      HE: () => globalThis.window.FinalizationRegistry,
      HF: s => s.trimLeft(),
      HG: (x0,x1) => x0.segment(x1),
      HH: (x0,x1) => { x0.placeholder = x1 },
      HI: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      HJ: x0 => x0.offsetHeight,
      HK: () => new Blob(),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Float64Array(x0),
      IC: x0 => x0.remove(),
      ID: s => new Date(s * 1000).getTimezoneOffset() * 60,
      IE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IF: (x0,x1) => x0[x1],
      IG: x0 => x0.index,
      IH: (x0,x1) => { x0.autocomplete = x1 },
      II: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      IJ: x0 => x0.offsetWidth,
      IK: (x0,x1,x2,x3) => x0.slice(x1,x2,x3),
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (x0,x1) => x0.appendChild(x1),
      JD: Date.now,
      JE: x0 => new window.FinalizationRegistry(x0),
      JF: x0 => x0.index,
      JG: x0 => x0.next(),
      JH: (x0,x1) => { x0.type = x1 },
      JI: () => new XMLHttpRequest(),
      JJ: x0 => x0.stopPropagation(),
      JK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      K: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      KB: x0 => new ArrayBuffer(x0),
      KC: (x0,x1) => x0.append(x1),
      KD: (x0,x1) => x0.contains(x1),
      KE: (x0,x1) => x0.unregister(x1),
      KF: (x0,x1) => x0.exec(x1),
      KG: x0 => x0.value,
      KH: (x0,x1) => { x0.name = x1 },
      KI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      KJ: x0 => x0.disabled,
      KK: (x0,x1) => x0.file(x1),
      L: o => o === undefined,
      LB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      LC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      LD: (decoder, codeUnits) => decoder.decode(codeUnits),
      LE: x0 => x0.preventDefault(),
      LF: s => s.toUpperCase(),
      LG: x0 => x0.done,
      LH: (x0,x1) => { x0.placeholder = x1 },
      LI: x0 => x0.send(),
      LJ: (x0,x1) => { x0.min = x1 },
      LK: x0 => x0.fullPath,
      M: o => String(o),
      MB: (x0,x1,x2) => new DataView(x0,x1,x2),
      MC: x0 => x0.style,
      MD: () => new TextDecoder("utf-8", {fatal: true}),
      ME: x0 => x0.parent,
      MF: x0 => x0.length,
      MG: (o, m, a) => o[m].apply(o, a),
      MH: (x0,x1) => { x0.scrollTop = x1 },
      MI: x0 => x0.type,
      MJ: (x0,x1) => { x0.max = x1 },
      MK: x0 => x0.name,
      N: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      NB: (o, p) => o[p],
      NC: x0 => x0.debugShowSemanticsNodes,
      ND: () => new TextDecoder("utf-8", {fatal: false}),
      NE: x0 => x0.timeStamp,
      NF: x0 => x0.flags,
      NG: x0 => x0.iterator,
      NH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      NI: x0 => x0.response,
      NJ: (x0,x1) => { x0.disabled = x1 },
      NK: (a, l) => a.length = l,
      O: (x0,x1) => x0.didCreateEngineInitializer(x1),
      OB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      OC: o => o,
      OD: (a, i, v) => a[i] = v,
      OE: (x0,x1) => x0.hasAttribute(x1),
      OF: (a, s) => a.join(s),
      OG: () => globalThis.Symbol,
      OH: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      OI: (x0,x1) => { x0.responseType = x1 },
      OJ: (x0,x1) => { x0.scrollLeft = x1 },
      OK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      P: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      PC: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      PD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      PE: x0 => x0.type,
      PF: (x0,x1) => x0.error(x1),
      PG: (x0,x1) => new Intl.Segmenter(x0,x1),
      PH: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      PI: x0 => x0.vendor,
      PJ: (x0,x1) => { x0.spellcheck = x1 },
      PK: (x0,x1) => x0.readEntries(x1),
      Q: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      QB: o => o.byteOffset,
      QC: (x0,x1) => x0.warn(x1),
      QD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      QE: (x0,x1) => x0.getModifierState(x1),
      QF: () => globalThis.console,
      QG: x0 => x0.Segmenter,
      QH: x0 => x0.keyCode,
      QI: x0 => x0.navigator,
      QJ: (x0,x1) => { x0.disabled = x1 },
      QK: x0 => x0.isDirectory,
      R: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      RB: o => o.buffer,
      RC: x0 => x0.console,
      RD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      RE: x0 => x0.buttons,
      RF: s => s.trimRight(),
      RG: x0 => x0.buffer,
      RH: (x0,x1) => x0.scrollIntoView(x1),
      RI: () => globalThis.window,
      RJ: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      RK: (x0,x1) => x0[x1],
      S: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SB: Function.prototype.call.bind(DataView.prototype.getUint8),
      SC: () => globalThis.window,
      SD: (s) => +s,
      SE: x0 => x0.ctrlKey,
      SF: x0 => x0.blur(),
      SG: x0 => x0.wasmMemory,
      SH: x0 => x0.multiViewEnabled,
      SI: x0 => x0.pop(),
      SJ: (x0,x1) => x0.getContext(x1),
      SK: x0 => x0.length,
      T: x0 => new Promise(x0),
      TB: (b, o) => new DataView(b, o),
      TC: (o, c) => o instanceof c,
      TD: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      TE: x0 => x0.getBoundingClientRect(),
      TF: x0 => x0.button,
      TG: () => globalThis.window._flutter_skwasmInstance,
      TH: (x0,x1) => x0.replaceWith(x1),
      TI: x0 => ({type: x0}),
      TJ: (x0,x1) => { x0.height = x1 },
      TK: x0 => x0.items,
      U: (x0,x1,x2) => x0.call(x1,x2),
      UB: (b, o, l) => new DataView(b, o, l),
      UC: (string, token) => string.split(token),
      UD: s => s.trim(),
      UE: x0 => x0.y,
      UF: (x0,x1) => x0.prepend(x1),
      UG: () => new TextDecoder(),
      UH: (x0,x1) => { x0.className = x1 },
      UI: (x0,x1) => new Blob(x0,x1),
      UJ: (x0,x1) => { x0.width = x1 },
      UK: x0 => x0.dataTransfer,
      V: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      VB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      VC: o => o instanceof Array,
      VD: x0 => x0.classList,
      VE: x0 => x0.x,
      VF: x0 => x0.parentElement,
      VG: (map, o, v) => map.set(o, v),
      VH: (x0,x1) => { x0.tabIndex = x1 },
      VI: x0 => globalThis.URL.createObjectURL(x0),
      VJ: x0 => x0.canvasKitMaximumSurfaces,
      VK: x0 => x0.extraAssets,
      W: x0 => new Array(x0),
      WB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      WC: (a, i) => a[i],
      WD: x0 => x0.relatedTarget,
      WE: x0 => x0.top,
      WF: x0 => x0.innerHeight,
      WG: (map, o) => map.get(o),
      WH: (x0,x1) => { x0.action = x1 },
      WI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      WJ: x0 => x0.hostElement,
      WK: x0 => x0.fontManifest,
      X: o => [o],
      XB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      XC: a => a.length,
      XD: x0 => x0.hasFocus(),
      XE: x0 => x0.left,
      XF: x0 => x0.innerWidth,
      XG: () => new WeakMap(),
      XH: (x0,x1) => { x0.method = x1 },
      XI: x0 => x0.debugSkipFontRetryDelay,
      XJ: x0 => x0.location,
      XK: x0 => x0.assetManifest,
      Y: (o0, o1) => [o0, o1],
      YB: (t, s) => t.set(s),
      YC: (x0,x1) => x0.test(x1),
      YD: x0 => x0.shiftKey,
      YE: x0 => x0.scrollTop,
      YF: x0 => x0.height,
      YG: (a, l) => a.length = l,
      YH: (x0,x1) => { x0.noValidate = x1 },
      YI: (x0,x1,x2) => x0.set(x1,x2),
      YJ: (x0,x1) => x0.getModifierState(x1),
      YK: x0 => x0.buildConfig,
      Z: (o0, o1, o2) => [o0, o1, o2],
      ZB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      ZC: x0 => x0.userAgent,
      ZD: x0 => x0.body,
      ZE: x0 => x0.offsetTop,
      ZF: x0 => x0.width,
      ZG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      ZH: x0 => x0.click(),
      ZI: x0 => x0.fontFallbackBaseUrl,
      ZJ: x0 => x0.metaKey,
      ZK: x0 => x0.length,
      a: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      aB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      aC: x0 => x0.navigator,
      aD: x0 => x0.visibilityState,
      aE: x0 => x0.scrollLeft,
      aF: x0 => x0.clientHeight,
      aG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      aH: (x0,x1) => x0.getElementsByClassName(x1),
      aI: (x0,x1) => x0.appendChild(x1),
      aJ: x0 => x0.altKey,
      aK: x0 => x0.getReader(),
      b: (x0,x1,x2) => { x0[x1] = x2 },
      bB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      bC: Function.prototype.call.bind(String.prototype.toLowerCase),
      bD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      bE: x0 => x0.offsetLeft,
      bF: x0 => x0.clientWidth,
      bG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      bH: (x0,x1) => x0.dispatchEvent(x1),
      bI: x0 => x0.click(),
      bJ: x0 => x0.ctrlKey,
      bK: x0 => x0.value,
      c: o => o,
      cB: Function.prototype.call.bind(DataView.prototype.getUint32),
      cC: Object.is,
      cD: x0 => x0.disconnect(),
      cE: x0 => x0.offsetParent,
      cF: x0 => x0.isConnected,
      cG: x0 => x0.history,
      cH: (x0,x1) => x0.createEvent(x1),
      cI: x0 => x0.remove(),
      cJ: x0 => x0.isComposing,
      cK: x0 => x0.done,
      d: (o, p) => o[p],
      dB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      dC: x0 => x0.vendor,
      dD: x0 => new Intl.Locale(x0),
      dE: x0 => x0.offsetY,
      dF: x0 => x0.head,
      dG: x0 => x0.search,
      dH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      dI: x0 => globalThis.URL.revokeObjectURL(x0),
      dJ: x0 => x0.code,
      dK: x0 => x0.read(),
      e: () => globalThis,
      eB: Function.prototype.call.bind(DataView.prototype.getInt32),
      eC: (x0,x1) => x0.createTextNode(x1),
      eD: x0 => x0.region,
      eE: x0 => x0.offsetX,
      eF: (x0,x1) => { x0.content = x1 },
      eG: x0 => x0.location,
      eH: x0 => x0.readText(),
      eI: x0 => x0.body,
      eJ: x0 => x0.repeat,
      eK: x0 => x0.body,
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      fC: (x0,x1) => { x0.id = x1 },
      fD: x0 => x0.script,
      fE: (o, p, r) => o.replace(p, () => r),
      fF: (x0,x1) => { x0.name = x1 },
      fG: x0 => x0.pathname,
      fH: x0 => x0.clipboard,
      fI: () => globalThis.document,
      fJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fK: x0 => x0.assetBase,
      g: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gB: o => o instanceof Uint16Array,
      gC: (x0,x1) => { x0.nonce = x1 },
      gD: x0 => x0.language,
      gE: (x0,x1) => { x0.lastIndex = x1 },
      gF: (x0,x1) => x0.removeChild(x1),
      gG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      gH: (x0,x1) => x0.writeText(x1),
      gI: (x0,x1) => { x0.display = x1 },
      gJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gK: x0 => x0.loader,
      h: (x0,x1) => ({addView: x0,removeView: x1}),
      hB: Function.prototype.call.bind(DataView.prototype.getUint16),
      hC: x0 => x0.nonce,
      hD: x0 => x0.languages,
      hE: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      hF: x0 => x0.firstChild,
      hG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      hH: x0 => x0.unlock(),
      hI: x0 => x0.style,
      hJ: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hK: () => globalThis._flutter,
      i: (l, r) => l === r,
      iB: o => o instanceof Int16Array,
      iC: () => globalThis.window.flutterConfiguration,
      iD: (x0,x1) => x0.observe(x1),
      iE: o => o instanceof RegExp,
      iF: x0 => x0.viewConstraints,
      iG: o => Object.keys(o),
      iH: (x0,x1) => x0.lock(x1),
      iI: (x0,x1) => { x0.download = x1 },
      iJ: x0 => x0.message,
      j: x0 => x0.random(),
      jB: Function.prototype.call.bind(DataView.prototype.getInt16),
      jC: (x0,x1) => x0.attachShadow(x1),
      jD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jE: x0 => x0.dotAll,
      jF: x0 => x0.hostElement,
      jG: x0 => x0.state,
      jH: x0 => x0.orientation,
      jI: (x0,x1) => { x0.href = x1 },
      jJ: x0 => x0.lastModified,
      k: o => o,
      kB: o => o instanceof Uint8ClampedArray,
      kC: (x0,x1) => x0.createElement(x1),
      kD: x0 => new ResizeObserver(x0),
      kE: x0 => x0.unicode,
      kF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kG: x0 => x0.hash,
      kH: (x0,x1) => x0.querySelector(x1),
      kI: (x0,x1) => x0.createElement(x1),
      kJ: x0 => x0.size,
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
      lD: (x0,x1) => x0.getPropertyValue(x1),
      lE: x0 => x0.ignoreCase,
      lF: x0 => ({runApp: x0}),
      lG: x0 => x0.state,
      lH: (x0,x1) => { x0.title = x1 },
      lI: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      lJ: x0 => x0.name,
      m: () => globalThis.Math,
      mB: Function.prototype.call.bind(DataView.prototype.setInt32),
      mC: x0 => x0.visualViewport,
      mD: x0 => globalThis.parseFloat(x0),
      mE: x0 => x0.multiline,
      mF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      mG: (x0,x1) => x0.go(x1),
      mH: (x0,x1) => x0.vibrate(x1),
      mI: x0 => x0.arrayBuffer(),
      mJ: x0 => x0.type,
      n: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      nB: Function.prototype.call.bind(DataView.prototype.setUint32),
      nC: x0 => x0.devicePixelRatio,
      nD: (x0,x1) => x0.getComputedStyle(x1),
      nE: (o, p, r) => o.replaceAll(p, () => r),
      nF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      nG: (x0,x1) => x0.querySelectorAll(x1),
      nH: x0 => x0.arrayBuffer(),
      nI: (x0,x1) => x0.transferFromImageBitmap(x1),
      nJ: (x0,x1) => x0.item(x1),
      o: b => !!b,
      oB: Function.prototype.call.bind(DataView.prototype.setInt16),
      oC: x0 => x0.height,
      oD: x0 => x0.documentElement,
      oE: x0 => x0.deltaMode,
      oF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      oG: x0 => x0.maxHeight,
      oH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      oI: x0 => x0.height,
      oJ: x0 => x0.length,
      p: () => globalThis.document,
      pB: Function.prototype.call.bind(DataView.prototype.setUint16),
      pC: x0 => x0.width,
      pD: x0 => x0.computedStyleMap(),
      pE: x0 => x0.deltaY,
      pF: (x0,x1) => x0.requestAnimationFrame(x1),
      pG: x0 => x0.maxWidth,
      pH: x0 => x0.status,
      pI: x0 => x0.width,
      pJ: x0 => x0.files,
      q: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qB: Function.prototype.call.bind(DataView.prototype.setUint8),
      qC: x0 => x0.screen,
      qD: (x0,x1) => x0.get(x1),
      qE: x0 => x0.deltaX,
      qF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qG: x0 => x0.minHeight,
      qH: (x0,x1) => x0.fetch(x1),
      qI: x0 => x0.rasterEndMilliseconds,
      qJ: (x0,x1) => { x0.multiple = x1 },
      r: (x0,x1) => x0.focus(x1),
      rB: Function.prototype.call.bind(DataView.prototype.setInt8),
      rC: (string, times) => string.repeat(times),
      rD: (o, p) => p in o,
      rE: x0 => x0.wheelDeltaY,
      rF: x0 => x0.now(),
      rG: x0 => x0.minWidth,
      rH: x0 => x0.content,
      rI: x0 => x0.rasterStartMilliseconds,
      rJ: (x0,x1) => { x0.accept = x1 },
      s: () => ({}),
      sB: Function.prototype.call.bind(DataView.prototype.getInt8),
      sC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      sD: (x0,x1) => { x0.textContent = x1 },
      sE: x0 => x0.wheelDeltaX,
      sF: x0 => x0.performance,
      sG: (x0,x1) => x0.removeProperty(x1),
      sH: x0 => x0.document,
      sI: x0 => x0.imageBitmaps,
      sJ: (x0,x1) => { x0.type = x1 },
      t: (o, p, v) => o[p] = v,
      tB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      tC: x0 => x0.tabIndex,
      tD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tE: x0 => x0.bottom,
      tF: (d, digits) => d.toFixed(digits),
      tG: (x0,x1) => x0.add(x1),
      tH: (a, i) => a.splice(i, 1),
      tI: (x0,x1) => { x0.height = x1 },
      tJ: (x0,x1) => x0.querySelector(x1),
      u: () => [],
      uB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      uC: (x0,x1) => x0.contains(x1),
      uD: x0 => x0.matches,
      uE: x0 => x0.right,
      uF: () => typeof dartUseDateNowForTicks !== "undefined",
      uG: x0 => x0.data,
      uH: a => a.pop(),
      uI: (x0,x1) => { x0.width = x1 },
      uJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      v: (a, i) => a.push(i),
      vB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      vC: x0 => x0.activeElement,
      vD: (x0,x1) => x0.matchMedia(x1),
      vE: x0 => x0.clientY,
      vF: () => Date.now(),
      vG: (x0,x1) => x0.removeAttribute(x1),
      vH: x0 => new WeakRef(x0),
      vI: x0 => x0.convertToBlob(),
      vJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      w: x0 => new Int8Array(x0),
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: x0 => x0.parentNode,
      wD: x0 => x0.matches,
      wE: x0 => x0.clientX,
      wF: () => 1000 * performance.now(),
      wG: (x0,x1) => { x0.value = x1 },
      wH: x0 => x0.deref(),
      wI: (x0,x1,x2) => new ImageData(x0,x1,x2),
      wJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      x: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      xB: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      xC: x0 => x0.tagName,
      xD: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      xE: x0 => x0.changedTouches,
      xF: x0 => new Uint8Array(x0),
      xG: (x0,x1) => { x0.value = x1 },
      xH: () => globalThis.WeakRef,
      xI: (x0,x1) => x0.getContext(x1),
      xJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      y: x0 => new Uint8Array(x0),
      yB: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      yC: x0 => x0.target,
      yD: f => f.dartFunction,
      yE: x0 => x0.key,
      yF: (x0,x1,x2) => x0.slice(x1,x2),
      yG: x0 => x0.value,
      yH: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      yI: (x0,x1) => new OffscreenCanvas(x0,x1),
      yJ: (x0,x1) => { x0.ondragleave = x1 },
      z: x0 => new Uint8ClampedArray(x0),
      zB: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      zC: x0 => x0.clientY,
      zD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zE: x0 => x0.identifier,
      zF: (x0,x1) => x0.decode(x1),
      zG: x0 => x0.selectionDirection,
      zH: (a, s, e) => a.slice(s, e),
      zI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      zJ: x0 => x0.preventDefault(),

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

    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
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
