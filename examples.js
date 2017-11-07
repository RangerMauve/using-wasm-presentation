var wabt = require("wabt");

main().catch( (e) => console.error(e));

async function main(){
	var add = (await createModule(`
		(module
			(func $add (param $lhs i32) (param $rhs i32) (result i32)
				(i32.add
					(get_local $lhs)
					(get_local $rhs)
				)
			)
			(export "add" (func $add))
		)
		`)).exports.add;

	console.log(`400 + 20 = ${add(400, 20)}`);

	var factorial = (await createModule(`
		(module
			(func $factorial (param $n i32) (result i32)
				(local $result i32)
				(set_local $result
					(i32.const 1)
				)
				(block
					(loop
						(br_if 1 (i32.eqz (get_local $n)))
						(set_local $result
							(i32.mul
								(get_local $n)
								(get_local $result)
							)
						)
						(set_local $n
							(i32.sub
								(get_local $n)
								(i32.const 1)
							)
						)
						(br 0)
					)
				)
				(get_local $result)
			)
			(export "factorial" (func $factorial))
		)
	`)).exports.factorial;

	console.log(`4! = ${factorial(4)}`);

	var memory_management = (await createModule(`
		(module
			(memory $0 1)
			(func $save (param $where i32) (param $what i32) (result i32)
				(i32.store (get_local $where) (get_local $what))
				(get_local $where)
			)
			(func $load (param $where i32) (result i32)
				(i32.load (get_local $where))
			)
			(export "save" (func $save))
			(export "load" (func $load))
		)
	`)).exports;

	console.log(`Saving 4, to 0: ${memory_management.save(0, 4)}`);
	console.log(`Loading from 0: ${memory_management.load(0)}`);
}

async function createModule(source, imports) {
	var parsed = wabt.parseWast("example.wast", source);

	var binary = parsed.toBinary({
		write_debug_names: true,
		log: true
	}).buffer;

	var module = await WebAssembly.compile(binary);
	var instance = await WebAssembly.Instance(module, imports||{});

	return instance;
}