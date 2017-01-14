import {
	test, setup,
} from './fixtures.js'

test(`Multiple objects of the same class are distinct objects`, (t) => {
	const fixtures = setup({ Example: { valA: {} }})
	let a, b
	try {
		a = new fixtures.Example({ valA: 'one' })
		b = new fixtures.Example({ valA: 'two' })
	} catch (e) {
		t.fail(`Failed to instantiate multiple objects of the same DataTrue class: ${e.message}`)
	}
	t.equal(a.valA, 'one', `First class has correct value`)
	t.equal(b.valA, 'two', `Second class has correct value`)
	t.end()
})