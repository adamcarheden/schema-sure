const Path = require('path')
import { test, setup,
} from './fixtures.js'

test(`Valid initial values does not throw (${Path.basename(__filename)})`, (t) => {
	const aMsg = `a must be greater than 10`
	const bMsg = `b must be less than 10`
	const fixtures = setup({
		Example: { 
			a: { validate: function() { if (this.a < 10) throw new Error(aMsg) } },
			b: { validate: function() { if (this.b > 10) throw new Error(bMsg) } },
		},
	})
	const a = 42
	const b = 9
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: a, b: b})
	}, `Can instantiate class with valid initial values`)
	if (e) {
		t.equal(e.a,a,`e.a has correct initial value`)
		t.equal(e.b,b,`e.b has correct initial value`)
	}
	t.end()
})
