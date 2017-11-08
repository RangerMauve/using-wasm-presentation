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

	var simple_memory = (await createModule(`
		(module
			(memory (export "mem") 1)
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

	console.log(`Saving 4, to 0: ${simple_memory.save(0, 4)}`);
	console.log(`Loading from 0: ${simple_memory.load(0)}`);
	var simple_memory_heap = new Uint32Array(simple_memory.mem.buffer);
	console.log(`Loading data directly from heap ${simple_memory_heap[0]}`);
	console.log(`Loading data from JS into heap: ${simple_memory_heap[0] = 420}`);
	console.log(`Loading manually set memory ${simple_memory.load(0)}`);
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

function miltiplyMatrices(a, b, aRows, bColumns, aColumn_bRows) {
	// Initialize result array
	var result = new Array(aRows * bColumns);
	// For each row in A
	for(var aRow = 0; aRow < aRows; aRow++)
		// For each column in B
		for(var bColumn = 0; bColumn < bColumns; bColumn++) {
			// Create initial counter
			var sum = 0;
			// Go through each column/row pair in A/B
			for(var shared = 0; shared < aColumn_bRows; shared++) {
				// Add the product of the two points to the sum
				sum += 
					// Get the a[row, current column]
					a[(aRow * aColumn_bRows) + shared] *
					// Get the b[current row, column]
					b[bColumn + (shared * bColumns)];
			}
			// Set the result in the array at [row, column] to the sum
			result[(aRow * bColumns) + bColumn] = sum;
		}
	return result;
}
