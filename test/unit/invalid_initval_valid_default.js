const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Invalid initial value throws even if default value is valid (${Path.basename(__filename)})`, (t) => {
	const msg = `a must be less than 10`
	const init = 42
	const dflt = 5
	const fixtures = setup({
		Example: { 
			a: { 
				default: dflt,
				validate: function() { if (this.a >= 10) throw new Error(msg) },
			}
		},
	})
	let e
	t.throws(() => {
		e = new fixtures.Example({a: init })
	}, new RegExp(msg), `Can't instantiate class with invalid intial value`)
	t.equal(typeof e, 'undefined', `e should be undefiend because it's constructor threw`)
	t.end()
})
