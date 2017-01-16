const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Valid default value does not throw (${Path.basename(__filename)})`, (t) => {
	const msg = `a must be greater than 10`
	const dflt = 42
	const fixtures = setup({
		Example: { a: { 
			default: dflt,
			validate: function() { if (this.a < 10) throw new Error(msg) },
		}},
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example()
	}, `Can instantiate class with valid default values`)
	if (e) t.equal(e.a,dflt,`e.a has correct default value`)
	t.end()
})
