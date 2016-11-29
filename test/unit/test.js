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

// When we add serialization, we'll eventually run
// every test before and after serializing/deserializing
// to ensure that functionality works
const runtest = function(name, opts, testfun) {
	if (arguments.length <= 2) {
		test(name, opts)
	} else {
		test(name, opts, testfun)
	}
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

runtest('Can instantiate simple empty class', (t) => {
	const fixtures = setup({
		Example: {}
	})
	var example // eslint-disable-line no-unused-vars
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Failed to instantiate simple empty class created by DataTrue')
	t.end()
})

runtest(`Instantiating class with failing validator fails`, (t) => {
	const failprop = 'failprop'
	const msg = 'This property is never valid'
	var props = {}
	props[failprop] = {
		validate: function() { throw new Error(msg) }
	}
	const fixtures = setup({
		Example: props
	})
	
	try {
		const example = new fixtures.Example() // eslint-disable-line no-unused-vars
		t.fail(`Instantiated class with validator that always throws an exception. That shouldn't be possible. Validators probably aren't running.`)
	} catch(e) {
		if (typeof e !== 'object') {
			t.fail(`Instantiating a DataTrue class with failing validator throw a '${typeof e}' instead of an object.`)
		} else if (!e.hasOwnProperty(failprop)) {
			t.fail(`Instantiating a DataTrue class with failing validator for '${failprop}' threw an object without a '${failprop}' key.\n${JSON.stringify(e)}`)
		} else if (!Array.isArray(e[failprop])) {
			t.fail(`Instantiating a DataTrue class with failing validator for '${failprop}' threw an object with something other than an array as the value for <thrown object>.'${failprop}'.`)
		} else if (e[failprop].length !== 1) {
			t.fail(`Instantiating a DataTrue class with failing validator for '${failprop}' threw an object with <thrown object>.'${failprop}'.length === '${e[failprop].length}'. Expected 1.`)
		} else if (!(e[failprop][0] instanceof Error)) {
			t.fail(`Instantiating a DataTrue class with failing validator for '${failprop}' threw an object with <thrown object>.'${failprop}'[0] that isn't an instance of Error`)
		} else if (e[failprop][0].message !== msg) {
			t.fail(`Instantiating a DataTrue class with failing validator for '${failprop}' threw an object with <thrown object>.'${failprop}'[0].message of '${e[failprop][0].message}'. Expecting '${msg}'`)
		}

		t.pass(`Instantiating a DataTrue class with failing validator an object with the expected format`)
	}
	t.end()
})

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
