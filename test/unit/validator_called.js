const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Validator is called (${Path.basename(__filename)})`, (t) => {
	var acount = 0
	var bcount = 0
	const aval = function() { acount++ }
	const bval = function() { bcount++ }
	const fixtures = setup({
		Example: { 
			a: { 
				default: 10,
				validate: aval
			},
			b: { 
				default: 'b',
				validate: bval
			}
		},
	})
	let e
	t.doesNotThrow(function() {
		e = new fixtures.Example()
		t.equal(e.a, 10, `Default value set on a`)
		t.equal(e.b, 'b', `Default value set on b`)
		t.equal(acount, 1, `A validator called on initialization`)
		t.equal(bcount, 1, `B validator called on initialization`)
		e.a = 11
		t.equal(acount, 2, `A validator called when a is set`)
		t.equal(bcount, 1, `B validator not called when only a is set`)
		e.b = 'B'
		t.equal(acount, 2, `A validator not called only B when a is set`)
		t.equal(bcount, 2, `B validator called when B is set`)
		e.atomicSet(function() {
			e.a++
			e.b += 'bee'
		})
		t.equal(acount, 3, `A validator called when A when a is set as part of atomic set`)
		t.equal(bcount, 3, `B validator called when B when a is set as part of atomic set`)
		t.equal(e.a, 12, `New A value assigned`)
		t.equal(e.b, 'Bbee', `New B value assigned`)

	}, `Exception not thrown because validator never throws`)

	t.end()
})
