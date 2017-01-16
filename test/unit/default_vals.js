const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Default values are set (${Path.basename(__filename)})`, (t) => {
	const a = 42
	const fixtures = setup({
		Example: { a: { default: a }}
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example()
	}, `Can instantiate class with default values`)
	if (e) t.equal(e.a,a,`e.a has default value`)
	t.end()
})
