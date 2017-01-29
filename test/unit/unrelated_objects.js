const Path = require('path')
import {
	test, setup,
	checkSSException
} from './fixtures.js'

test(`Validation across unrelated objects using atomicSet() (${Path.basename(__filename)})`, (t) => {
	const msg = 'val must be > 10'
	const vfun = function() { if (this.val > 10) throw new Error(msg) }
	const fixtures = setup({
		A: { val: { validate: vfun, default: 0 }},
		B: { val: { validate: vfun, default: 0 }},
	})

	let a, b
	t.doesNotThrow(function() {
		a = new fixtures.A()
		b = new fixtures.B()
	})
	try {
		fixtures.schema.atomicSet(function() {
			a.val = 11
			b.val = 12
		})
		t.fail(`Setting invalid values throws an exception`)
	} catch (e) {
		t.equal(a.val, 0, `Invalid value was not set on a`)
		t.equal(b.val, 0, `Invalid value was not set on b`)
		let expect = new Map([
			[a,{val: undefined}],
			[b,{val: undefined}],
		])
		if (checkSSException(t,e, expect)) {
			let aex = e.getExceptionsFor(a,'val',false)
			t.equal(aex.length,1,`Exactly one exception throw for a.val`)
			t.equal(aex[0].message,msg,`Exception thrown for object 'a'`)
			let bex = e.getExceptionsFor(b,'val',false)
			t.equal(bex.length,1,`Exactly one exception throw for b.val`)
			t.equal(bex[0].message,msg,`Exception thrown for object 'b'`)
		}
	}

	t.end()
})
