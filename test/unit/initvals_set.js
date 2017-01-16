const Path = require('path')
import { test, setup } from './fixtures.js'

test(`Initial values are set (${Path.basename(__filename)})`, (t) => {
	const fixtures = setup({
		Example: { a: {} },
	})
	const a = 42
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: a})
	},`Can instantiate class with initial values`)
	if (e) t.equal(e.a,a,`Initial values are set correctly`)
	t.end()
})
