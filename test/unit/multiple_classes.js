const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Can define and instantiate multiple classes (${Path.basename(__filename)})`, (t) => {
	const fixtures = setup({ 
		ExampleA: { valA: {} },
		ExampleB: { valB: {} },
	})
	let a, b
	try {
		a = new fixtures.ExampleA({ valA: 'one' })
		b = new fixtures.ExampleB({ valB: 'two' })
	} catch (e) {
		t.fail(`Failed to instantiate objects from two different DataTrue classes: ${e.message}`)
	}
	t.equal(a.valA, 'one', `First class has correct value`)
	t.equal(b.valB, 'two', `Second class has correct value`)
	t.end()
})
