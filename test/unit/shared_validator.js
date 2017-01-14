import {
	test, setup,
} from './fixtures.js'

test(`Shared validators are called only once per object`, (t) => {
	var x = 0
	let v = function() { x += 1 }
	const fixtures = setup({ Example: { 
		valA: { validate: v},
		valB: { validate: v},
	}})
	var ex
	try {
		ex = new fixtures.Example({ valA: 'one', valB: 'two' }) // eslint-disable-line no-unused-vars 
	} catch (e) {
		t.fail(`Failed to instantiate object with validator shared between two properties: ${e.message}`)
	}
	t.equal(ex.valA, 'one', `First class has correct value`)
	t.equal(ex.valB, 'two', `Second class has correct value`)
	t.equal(x, 1, `Shared validator function was called exactly once`)
	t.end()
})
