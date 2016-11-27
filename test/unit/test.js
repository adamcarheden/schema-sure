import test from 'tape'


const setup = (classes) => {
	const DataTrue = require('../../DataTrue')
	const schema = new DataTrue()
	var fixtures = {
		DataTrue: DataTrue,
		schema: schema,
	}
	Object.keys(classes).forEach((name) => {
		fixtures[name] = schema.createClass(classes[name])
	})
	return fixtures
}

/*
const teardown = (fixtures) => {
}
*/

/*
const before = test
before('before', function(assert) {
	assert.pass('do something before tests')
	assert.end()
})
*/

test('Can instantiate simple empty class', (t) => {
	const fixtures = setup({
		Example: {}
	})
	var example // eslint-disable-line no-unused-vars
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Failed to instantiate simple empty class created by DataTrue')
	t.end()
})

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
