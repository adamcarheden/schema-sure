import test from 'tape'
import DataTrue from '../../DataTrue'

const setup = (classes) => {
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

const checkDTException = function(t, ex, expectProps, actionDescr) {
	if (typeof expectProps !== 'object') {
		t.fail(`Test infrastructure: expectProps arg of checkDTException should be an object, not a ${typeof expectProps}`)
		return false
	}
	if (Array.isArray(expectProps)) {
		const ep = expectProps
		expectProps = {}
		ep.forEach(function(p) { expectProps[p] = false })
	}
	if (Object.keys(expectProps).length < 1) {
		t.fail("expectProps arg to checkDTException is empty, which means we wouldn't check anything. That's almost certainly incorrect.")
		return false
	}
	t.true(ex instanceof Error, `Test infrastructure: Error object passed to checkDTException: ${ex.message}`)
	t.true('AtomicSetError' in ex, `Error thrown by DataTrue is a AtomicSetError: ${ex.message} `)
	Object.keys(expectProps).forEach(function(badprop) {
		if (typeof ex.exceptions !== 'object') {
			t.fail(`${actionDescr} threw a '${typeof e}' instead of an object.`)
		} else if (!ex.exceptions.hasOwnProperty(badprop)) {
			t.fail(`${actionDescr} for '${badprop}' threw an object without a '${badprop}' key`)
		} else if (!Array.isArray(ex.exceptions[badprop])) {
			t.fail(`${actionDescr} for '${badprop}' threw an object with something other than an array as the value for <thrown object>.'${badprop}'.`)
		} else if (ex.exceptions[badprop].length !== 1) {
			t.fail(`${actionDescr} for '${badprop}' threw an object with <thrown object>.'${badprop}'.length === '${ex.exceptions[badprop].length}'. Expected 1.`)
		} else if (!(ex.exceptions[badprop][0] instanceof Error)) {
			t.fail(`${actionDescr} for '${badprop}' threw an object with <thrown object>.'${badprop}'[0] that isn't an instance of Error`)
		} else {
			if (typeof expectProps[badprop] === 'object' && expectProps[badprop] instanceof RegExp) {
				if (!ex.exceptions[badprop][0].message.match(expectProps[badprop])) {
					t.fail(`${actionDescr} for '${badprop}' threw an object with <thrown object>.'${badprop}'[0].message of '${ex.exceptions[badprop][0].message}'. Expecting it to match '${expectProps[badprop]}'`)
				}
			} else if (typeof expectProps[badprop] === 'string') {
				if (ex.exceptions[badprop][0].message !== expectProps[badprop]) {
					t.fail(`${actionDescr} for '${badprop}' threw an object with <thrown object>.'${badprop}'[0].message of '${ex.exceptions[badprop][0].message}'. Expecting '${expectProps[badprop]}'`)
				}
			} else if (expectProps[badprop] !== false) {
				t.fail(`Test infrastructure: A ${typeof expectProps[badprop]} was passed to checkDTException for key '${badprop}' of the expectProps argument. Expecting a string, a RegExp or false`)
			}
		}
	})
}

test('Can instantiate simple empty class', (t) => {
	const fixtures = setup({
		Example: {}
	})
	var example // eslint-disable-line no-unused-vars
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Instantiate simple empty class created by DataTrue')
	t.end()
})

test(`Instantiating class with failing validator should throw an exception`, (t) => {
	const failprop = 'failprop'
	const msg = 'This property is never valid'
	var props = {}
	props[failprop] = {
		validate: function() { 
			throw new Error(msg) 
		}
	}
	const fixtures = setup({
		Example: props
	})
	
	try {
		const example = new fixtures.Example() // eslint-disable-line no-unused-vars
		t.fail(`Instantiated class with validator that always throws an exception. That shouldn't be possible. Validators probably aren't running.`)
	} catch(e) {
		var expect = {}
		expect[failprop] = msg
		checkDTException(t, e, expect, 'Instantiating a DataTrue class with a failing validator')
	}
	t.end()
})

test(`Setting an invalid value should throw an exception`, (t) => {
	const prop = 'myprop'
	const msg = `${prop} must be an int`
	const isNum = function() { 
		if (this[prop] === undefined) return
		if (!this[prop].match(/^\d+$/)) throw new Error(msg) 
	}
	var objProps = {}
	objProps[prop] = { validate: isNum }
	const fixtures = setup({ Example: objProps })
	var example
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Instantiate a class with a validated property')
	try {
		example[prop] = 'abc'
		t.fail(`Expected exception when setting invalid value`)
	} catch (e) {
		var expect = {}
		expect[prop] = msg
		checkDTException(t,e,expect,'Setting an invalid value')
	}
	
	t.end()

})

// Set multiple invalid properties. Make sure all throw
test(`Setting multiple invalid values should throw the right exceptions for each`, (t) => {
	const isNum = function() { 
		if (this.numprop === undefined) return
		if (!this.numprop.match(/^\d+$/)) throw new Error(`'${this.numprop}' isn't a number`) 
	}
	const isAlpha = function() {
		if (this.alphaprop === undefined) return
		if (!this.alphaprop.toString().match(/^[a-zA-Z]+$/)) throw new Error(`'${this.alphaprop}' isn't letters`) 
	}
	var objProps = {
		numprop: { validate: isNum },
		alphaprop: { validate: isAlpha },
	}
	const fixtures = setup({ Example: objProps })
	try {
		let example = new fixtures.Example({  // eslint-disable-line no-unused-vars
			numprop: 'abc',
			alphaprop: 123,
		})
		t.fail(`Expected exception when setting invalid values`)
	} catch (e) {
		var expect = {
			numprop: '\'abc\' isn\'t a number',
			alphaprop: '\'123\' isn\'t letters',
		}
		checkDTException(t,e,expect,'Setting invalid values')
	}
	
	t.end()
})

// Set a mix of valid and invalid properties. Make sure only valid ones throw
// Set a prop with multiple validators. Make sure all are called
// Set a validator on multiple properties. Make sure it's only called once
// Instantiate multiple objects of the same class. Make sure validator is called on the right one.
// Define multiple classes
// Instantiate multiple objects of different classes
// Set the same validator on multiple objects of different classes. Make sure validator is called on the right objects
// DataTrue Obj as a prop?

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
