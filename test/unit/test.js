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

const checkDTException = function(t, ex) {
	if (!(ex instanceof Error)) {
		t.fail(`Test infrastructure: Error object passed to checkDTException is an exception: ${ex.message}`)
		return false
	}
	if (!('AtomicSetError' in ex)) {
		t.fail(`Error thrown by DataTrue is an AtomicSetError.: ${ex}\n${ex.stack}`)
		return false
	}
	if (!('exceptions' in ex)) {
		t.fail(`AtomicSetError has an exceptions property`)
		return false
	}
	if (typeof ex.exceptions !== 'object') {
		t.fail(`The exceptions property of AtomicSetError is an object`)
		return false
	}
	if (Object.keys(ex.exceptions).length < 1) {
		t.fail(`AtomicSetError.exceptions isn't empty`)
		return false
	}
	var ok = true
	Object.keys(ex.exceptions).forEach(function(badprop) {
		if (!Array.isArray(ex.exceptions[badprop])) {
			t.fail(`All properties of the AtomicSetError.exceptions are arrays.`)
			ok = false
			return false
		}
		t.assert(ex.exceptions[badprop].length >= 1, `DataTrue exceptions arrays have at least 1 member. '${badprop}' has '${ex.exceptions[badprop].length}'`)
		ex.exceptions[badprop].forEach(function(e) {
			if (!(e instanceof Error)) {
				t.fail(`All object in the exceptions array for property '${badprop}' are instances of Error. '${typeof e}' of type '${e.constructor.name}' is an instance of Error.`)
				ok = false
			}
		})
	})
	return ok
}

test('Can instantiate simple empty DataTrue class', (t) => {
	const fixtures = setup({
		Example: {}
	})
	var example // eslint-disable-line no-unused-vars
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Instantiate simple empty class created by DataTrue')
	t.end()
})

test(`Initial values are set`, (t) => {
	const fixtures = setup({
		Example: { a: {} },
	})
	const a = 42
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: a})
	},`Can instantiate class with initial values`)
	t.equal(e.a,a,`Initial values are set`)
	t.end()
})

test(`Invalid initial value throws`, (t) => {
	const msg = `a must be less than 10`
	const fixtures = setup({
		Example: { a: { validate: function() { if (this.a >= 10) throw new Error(msg) } } },
	})
	const a = 42
	let e
	t.throws(() => {
		e = new fixtures.Example({a: a})
	}, msg, `Can't instantiate class with invalid initial values`)
	t.equal(typeof e, 'undefined',`e not created if initial value is invalid`)
	t.end()
})

test(`Valid initial value does not throw`, (t) => {
	const msg = `a must be greater than 10`
	const fixtures = setup({
		Example: { a: { validate: function() { if (this.a < 10) throw new Error(msg) } } },
	})
	const a = 42
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: a})
	}, `Can instantiate class with valid initial value`)
	t.equal(e.a,a,`e.a has correct initial value`)
	t.end()
})

test(`Multiple valid initial values does not throw`, (t) => {
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
	t.equal(e.a,a,`e.a has correct initial value`)
	t.equal(e.b,b,`e.b has correct initial value`)
	t.end()
})

test(`Default values are set`,(t) => {
	const a = 42
	const fixtures = setup({
		Example: { a: { default: a }}
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example()
	}, `Can instantiate class with default values`)
	t.equal(e.a,a,`e.a has default value`)
	t.end()
})

test(`Initial values override default values `,(t) => {
	const init = 42
	const dflt = 10
	const fixtures = setup({
		Example: { a: { default: dflt }}
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example({a: init})
	}, `Can instantiate class with default and intial values`)
	t.equal(e.a,init,`e.a has initial value`)
	t.end()
})


test(`Invalid default value throws`, (t) => {
	const msg = `a must be less than 10`
	const dflt = 42
	const fixtures = setup({
		Example: { a: { 
			default: dflt,
			validate: function() { if (this.a >= 10) throw new Error(msg) },
		}},
	})
	let e
	t.throws(() => {
		e = new fixtures.Example()
	}, msg, `Can't instantiate class with invalid default value`)
	t.equal(typeof e, 'undefined',`e not created if default value is invalid`)
	t.end()
})

test(`Valid default value does not throw`, (t) => {
	const msg = `a must be greater than 10`
	const dflt = 42
	const fixtures = setup({
		Example: { a: { 
			default: dflt,
			validate: function() { if (this.a < 10) throw new Error(msg) },
		}},
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example()
	}, `Can instantiate class with valid default values`)
	t.equal(e.a,dflt,`e.a has correct default value`)
	t.end()
})


test(`Invalid initial value throws even if default value is valid`,(t) => {
	const msg = `a must be less than 10`
	const init = 42
	const dflt = 5
	const fixtures = setup({
		Example: { a: { 
			default: dflt,
			validate: function() { if (this.a >= 10) throw new Error(msg) },
		}},
	})
	let e
	t.throws(() => {
		e = new fixtures.Example({a: init })
	}, msg, `Can't instantiate class with invalid intial value`)
	t.equal(typeof e, 'undefined', `e was defined even though it's constructor threw`)
	t.end()
})

test(`Instantiating class with failing validator should throw an exception`, (t) => {
	const prop = 'failprop'
	const msg = 'This property is never valid'
	var props = {}
	props[prop] = {
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
		if (checkDTException(t, e)) {
			t.assert(prop in e.exceptions, `Should throw an exception for '${prop}'`)
			t.equal(e.exceptions[prop].length, 1 , `Should throw exactly 1 exception for '${prop}'`)
			t.assert(e.exceptions[prop][0].message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(e.message, msg, `Message should be '${msg}'`)
		}
	}
	t.end()
})

test(`Setting an invalid value should throw an exception and NOT change the value`, (t) => {
	const prop = 'myprop'
	const msg = `${prop} must be an int`
	const isNum = function() { 
		if (this[prop] === undefined) return
		if (!this[prop].toString().match(/^\d+$/)) throw new Error(msg) 
	}
	let objProps = {}
	objProps[prop] = { validate: isNum }
	const fixtures = setup({ Example: objProps })
	let example
	let val = 123
	t.doesNotThrow(() => {
		let init = {}
		init[prop] = val
		example = new fixtures.Example(init)
	}, 'Instantiate a class with a validated property and a valid value should not throw an exception')
	t.equal(example[prop], val, `Value passed to constructor should be assigned to appropriate property`)
	try {
		example[prop] = 'abc'
		t.fail(`Expected exception when setting invalid value`)
	} catch (e) {
		t.equal(example[prop], val, `Invalid value should NOT be assigned to property`)
		if (checkDTException(t,e)) {
			t.assert(prop in e.exceptions, `Should throw an exception for '${prop}'`)
			t.equal(e.exceptions[prop].length, 1 , `Should throw exactly 1 exception for '${prop}'`)
			t.equal(e.exceptions[prop][0].message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(e.message, msg, `Message should be '${msg}'`)
		}
	}
	t.end()
})

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
		if (checkDTException(t,e)) {
			Object.keys(expect).forEach(function(prop) {
				t.assert(prop in e.exceptions, `Should throw an exception for '${prop}'`)
				t.equal(e.exceptions[prop].length, 1, `Should throw exactly 1 exception for '${prop}'`)
				t.equal(e.exceptions[prop][0].message, expect[prop], `Message for '${prop}' should be '${expect[prop]}'`)
			})
		}
	}
	
	t.end()
})

test(`Setting a mix of valid and invalid values should throw exceptions only for the invalid ones`, (t) => {
	const isNum = function() { 
		if (this.numprop === undefined) return
		if (!this.numprop.toString().match(/^\d+$/)) throw new Error(`'${this.numprop}' isn't a number`) 
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
			numprop: 123,
			alphaprop: 123,
		})
		t.fail(`Expected exception when setting invalid values`)
	} catch (e) {
		let alphapropmsg = '\'123\' isn\'t letters'
		if (checkDTException(t,e)) {
			t.assert(!('numprop' in e.exceptions),`Sould NOT throw an exception for numprop`)
			t.assert('alphaprop' in e.exceptions, `Should throw an exception for alphaprop`)
			t.equal(e.exceptions.alphaprop.length, 1 , `Should throw exactly 1 exception for alphaprop`)
			t.equal(e.exceptions.alphaprop[0].message, alphapropmsg , `Message for alphaprop should be '${alphapropmsg}'`)
		}
	}
	
	t.end()
})

test(`All validators are called on properties with multiple validators`, (t) => {
	var v1 = 0
	var v2 = 0
	var objProps = {
		myprop: { validate: [
			function() { v1 += 1 },
			function() { v2 += 1 },
		]},
	}
	const fixtures = setup({ Example: objProps })
	try {
		let example = new fixtures.Example({})  // eslint-disable-line no-unused-vars
		t.equal(v1, 1, `First validator was called`)
		t.equal(v2, 1, `Second validator was called`)
	} catch (e) {
		t.fail(`Instantianting a class with multiple validators on a single property should not throw an exception`)
	}
	
	t.end()
})

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

test(`Can define and instantiate multiple classes`, (t) => {
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
	t.equal(x, 1, `Shared validator function was called only once`)
	t.end()
})

// DataTrue Obj as a prop?
test(`Validation across related objects`, (t) => {

	const msg = `a must be less than 10`
	const fixtures = setup({
		A: {
			val: {
				validate: {
					enumerable: true,
					validate: function() {
						if (typeof this.a === 'object' && typeof this.a.val !== 'undefined' && this.a.val > 10) throw new Error(msg)
					},
					applyTo: function() { 
						return (typeof this.b === 'undefined') ? false : this.b 
					},
				}
			},
			b: { enumerable: true, },
		},
		B: { a: { enumerable: true } },
	})

	var a, b
	try {
		a = new fixtures.A()
	} catch (e) {  
		t.fail(`Failed to instantiate test class 'A': ${e}`) 
		t.end()
		return
	}
	try {
		b = new fixtures.B() 
	} catch (e) {  
		t.fail(`Failed to instantiate test class 'B': ${e}`) 
		t.end()
		return
	}
	t.doesNotThrow(() => {
		a.b = b
		b.a = a
	},`Assign cross-references`)
	t.equal(a.b, b, `Reference a.b assigned`) // Because our validator ignores this case
	t.equal(b.a, a, `Reference b.a assigned`) // Because our validator ignores this case
	try {
		a.val = 11
		t.fail(`Validator did not throw and exception when an invalid value was assigned.`)
	} catch (e) {
		t.equal(e.message, msg, `Exception thrown is from validator`)
		if (checkDTException(t,e)) {
			t.equal(typeof a.a, 'undefined',`invalid value not assigned`)
		}
	}
	t.doesNotThrow(() => {
		a.val = 9
	}, `Can assign valid value`)
	t.equal(a.val,9,`Value correct after valid assignment`)
	t.equal(a.b.a.val,9,`cross-references intact`)

	t.end()
})

/*
// This hasn't been implemented yet
test(`Instantiate interdependent objects`,(t) => {
	const schema = new DataTrue()
	const aMsg = `b is not an A`
	const A = schema.createClass({
		b: {
			validate: function() { if (!(this.b instanceof A)) throw new Error(aMsg) }
		},
	})
	const bMsg = `a is not a B`
	const B = schema.createClass({
		a: {
			validate: function() { if (!(this.a instanceof B)) throw new Error(bMsg) }
		},
	})

	let a, b
	t.throws(() => {
		a = new A()
	}, aMsg, `Can't instantiate an A without a B`)
	t.equal(typeof a,'undefined',`a is not defined`)
	t.throws(() => {
		b = new B()
	}, bMsg, `Can't instantiate a B without an A`)
	t.equal(typeof b,'undefined',`b is not defined`)

	t.doesNotThrow(() => {
		a = new A({ b: { DataTrue: B }})
	}, `Can create related objects at once`)

	t.end()
})
*/

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
