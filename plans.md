- Intro
	- Whoami
		- Georgiy S
		- @rangermauve (everywhere)
		- Technical lead at Aetonix
	- What is it
		- Assembly format for the web
			- Example
				```WASM
				(func (param i32) (param f32) (local f64)
					get_local 0
					get_local 1
					get_local 2)
				```
- History
	- People wanted to run heavy applications in the browser
		- Existing codebases written in C/C++
		- Complex game engines
	- ASM.js
		- Subset of JS that is easy for engines to optimize
		- How ASM works
			- Instead of allocating JS objects and other memory, creates one huge array of bytes which it uses for continuous memory, then it uses type-coersion to let the VM compile it directly to CPU instructions
			- Example
				```javascript
				function DiagModule(stdlib, foreign, heap) {
					"use asm";

					// Variable Declarations
					var sqrt = stdlib.Math.sqrt;

					// Function Declarations
					function square(x) {
						x = +x;
						return +(x*x);
					}

					function diag(x, y) {
						x = +x;
						y = +y;
						return +sqrt(square(x) + square(y));
					}

					return { diag: diag };
				}
				```
	- Emscripten
		- Compiles C++ into ASM.js using LLVM compiler toolchain
		- The go-to tool that most projects use
		- Provides runtimes for integrating with browser
		- Projects using it:
			- Unreal Engine 4 https://www.unrealengine.com/en-US/html5/
			- Unity https://files.unity3d.com/jonas/AngryBots/
			- More examples: https://github.com/kripken/emscripten/wiki/Porting-Examples-and-Demos
	- Limitations
		- Huge JS files (many megabytes)
		- Long time to parse
		- Limited to things that JS could do (no multi-threading, etc)
- WASM
	- People wanted something better
	- Mozilla, Google, Microsoft worked together to create a new standard
	- Focused on minimal viable product with a well defined bytecode
- JavaScript API
	- WASM is used to define modules
	- Uses compiled WASM bytecode
	- Can export functions
	- Can provide imports with JS functions, or other modules
	- Module Memory accessible to JS
- Tools
	- Textual representation (wast)
		```wast
		(func (param i32) (param f32) (local f64)
			get_local 0
			get_local 1
			get_local 2)
		```
	- wabt (WebAssembly Binary Toolkit)
	- wabt.js Pure JS implementation
	- Glue for putting everything together
		```javascript
		async function createModule(source, imports) {
			var parsed = wabt.parseWast("example.wast", source);

			var binary = parsed.toBinary({
				write_debug_names: true,
				log: true
			}).buffer;

			var module = await WebAssembly.compile(binary);
			var instance = await WebAssembly.Instance(module, imports || {});

			return instance;
		}
		```
- Examples
	- Function declaration
		```wast
		(func $identity (param i32) (result i32) ...etc)
		```
	- Local variables
		```
		(func (param $bar i32)
			(local $foo i32)
			(set_local $foo
				(get_local $bar)
			)
		)
		```
	- Module with exported function
		```wast
		(module
			(func $add (param $lhs i32) (param $rhs i32) (result i32)
				(i32.add
					(get_local $lhs)
					(get_local $rhs)
				)
			)
			(export "add" (func $add))
		)
		```
		```javascript
		var mymodule = await createModule(sourcecodehere);

		// Returns 420
		mymodule.exports.add(400, 20);
		```

- References
	- Support http://caniuse.com/#feat=wasm
	- MDN WAST https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format
	- wabt.js https://github.com/AssemblyScript/wabt.js
	- Good overview of various pieces of syntax http://webassembly.org/docs/semantics/
	- Debug manual WASM programs https://mbebenita.github.io/WasmExplorer/
	- Assemblyscript playground. Write typescript-like lang, compile to WAST https://maxgraey.github.io/Assembleash/#AssemblyScript