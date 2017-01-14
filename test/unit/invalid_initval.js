import { 
	test, setup,
} from './fixtures.js'

test(`Invalid initial value throws`, (t) => {
	const msg = `a must be less than 10`
	const fixtures = setup({
		Example: { a: { validate: function() { if (this.a >= 10) throw new Error(msg) } } },
	})
	const a = 42
	let e
	t.throws(() => {
		e = new fixtures.Example({a: a})
	}, new RegExp(msg), `Can't instantiate class with invalid initial values`)
	t.equal(typeof e, 'undefined',`e not created if initial value is invalid`)
	t.end()
})
