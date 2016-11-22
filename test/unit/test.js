import test from 'tape'


const setup = () => {
	const fixtures = {
		DataTrue: require('../../DataTrue')
	}
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

test('Public API', (assert) => {
	const fixtures = setup()
	assert.ok(('getExports' in fixtures.DataTrue),'getExports() function missing')
	assert.end()
})

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
