(async () => {
    var wsam = await (await fetch('util/out.wasm')).blob()

    var outBuff = new ArrayBuffer(5000)

    globalThis.module = await WebAssembly.instantiate(await wsam.arrayBuffer(), {
        'env': {
            'emscripten_resize_heap': function (params) { console.log('emscripten_resize_heap',...params) },
            '__main_argc_argv': function (params) { console.log('emscripten_resize_heap',...params) },
        },
        'wasi_snapshot_preview1': { 
            'proc_exit': function (...params) { console.log('proc_exit',...params) },
            'fd_write': function (...params) { console.log('fd_write',...params); return true },
            'fd_close': function (...params) { console.log('fd_close',...params) },
            'fd_seek': function (...params) { console.log('fd_seek',...params) },
            'args_sizes_get': function (...params) { console.log('args_sizes_get',...params) },
            'args_get': function (...params) { console.log('args_get',...params) },
        }
    })

    console.log(module)
})()

// [Log] fd_write – 1 – 5245680 – 2 – 5245676 (wsam.js, line 12, x1771)