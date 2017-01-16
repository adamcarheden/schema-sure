const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Invalid default value throws (${Path.basename(__filename)})`, (t) => {
	const msg = `a must be less than 10`
	const dflt = 42
	const fixtures = setup({
		Example: { a: { 
			default: dflt,
			validate: function() { if (this.a >= 10) throw new Error(msg) },
		}},
	})
	let e
	t.throws(() => {
		e = new fixtures.Example()
	}, new RegExp(msg), `Can't instantiate class with invalid default value`)
	t.equal(typeof e, 'undefined',`e not created if default value is invalid`)
	t.end()
})
