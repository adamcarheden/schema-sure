const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Initial values override default values  (${Path.basename(__filename)})`, (t) => {
	const init = 42
	const dflt = 10
	const fixtures = setup({
		Example: { a: { default: dflt }}
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: init})
	}, `Can instantiate class with default and intial values`)
	if (e) t.equal(e.a,init,`e.a has initial value`)
	t.end()
})
