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

// TODO: failed validation does NOT modify any managed property

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
	}, new RegExp(msg), `Can't instantiate class with invalid initial values`)
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
	}, new RegExp(msg), `Can't instantiate class with invalid default value`)
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

test(`Set unmanaged property in atomicSet() using object reference instead of this`, (t) => {

	const fixtures = setup({
		Example: {},
	})
	let ex
	t.doesNotThrow(() => {
		ex = new fixtures.Example()
	},`Can instantiate empty class`)
	t.equal(typeof ex.a, 'undefined', `Unmanaged property not defined yet`)
	let val = 10
	t.doesNotThrow(function() {
		ex.atomicSet(function() {
			ex.a = val
		})
	},`Can set unmanaged property`)
	t.equal(ex.a, val, `Unmanaged property was set`)

	t.end()
})

test(`Validator is called`,(t) => {
	var acount = 0
	var bcount = 0
	const aval = function() { acount++ }
	const bval = function() { bcount++ }
	const fixtures = setup({
		Example: { 
			a: { 
				default: 10,
				validate: aval
			},
			b: { 
				default: 'b',
				validate: bval
			}
		},
	})
	let e
	t.doesNotThrow(function() {
		e = new fixtures.Example()
		t.equal(e.a, 10, `Default value set on a`)
		t.equal(e.b, 'b', `Default value set on b`)
		t.equal(acount, 1, `A validator called on initialization`)
		t.equal(bcount, 1, `B validator called on initialization`)
		e.a = 11
		t.equal(acount, 2, `A validator called when a is set`)
		t.equal(bcount, 1, `B validator not called when only a is set`)
		e.b = 'B'
		t.equal(acount, 2, `A validator not called only B when a is set`)
		t.equal(bcount, 2, `B validator called when B is set`)
		e.atomicSet(function() {
			this.a++
			this.b += 'bee'
		})
		t.equal(acount, 3, `A validator called when A when a is set as part of atomic set`)
		t.equal(bcount, 3, `B validator called when B when a is set as part of atomic set`)
		t.equal(e.a, 12, `New A value assigned`)
		t.equal(e.b, 'Bbee', `New B value assigned`)

	}, `Exception not thrown because validator never throws`)

	t.end()
})

test('validator is called when using atomicSet()', (t) => {
	var obj
	var MAX = 10
	var init = MAX / 2
	var msg = `The sum of valA and valB must be less than ${MAX}`
	t.doesNotThrow(() => {
		var schema = new DataTrue()
		var MyClass = schema.createClass({
			valA: {
				default: init,
				validate: 'isValid',
			},
			valB: {
				default: init,
				validate: 'isValid',
			},
			isValid: { value: function() {
				if (this.valA + this.valB > 10) throw new Error(msg)
			}}
		})
		obj = new MyClass()
	}, `Can create classes`)
	
	t.throws(function() {
		obj.valA = 6 // valA=6 + valB=5 won't validate, so this thows...
		obj.valB = 4 // ...and this is never reached
	}, new RegExp(msg), `setting invalid intermediate value without atomicSet fails`)
	t.equal(obj.valA, init, `invalid value for A is not set`)
	t.equal(obj.valB, init, `invalid value for B is not set`)

	t.throws(function() {
		obj.atomicSet(function() {
			this.valA = MAX
			this.valB = MAX
		})
	}, new RegExp(msg), `setting invalid values with atomicSet fails`)
	t.equal(obj.valA, init, `atomicSet() prevents invalid A value from being set`)
	t.equal(obj.valB, init, `atomicSet() prevents invalid B value from being set`)

	t.doesNotThrow(function() {
		obj.atomicSet(function() {
			this.valA = 6
			this.valB = 4
		})
	}, `setting invalid intermediate values with atomicSet does not fail`)
	t.equal(obj.valA, 6, `A is correct after atomicSet()`)
	t.equal(obj.valB, 4, `B is correct after atomicSet()`)

	t.end()
})

test(`Validator is called when property is set by a method`,(t) => {
	var acount = 0
	var bcount = 0
	const aval = function() { acount++ }
	const bval = function() { bcount++ }
	const fixtures = setup({
		Example: { 
			a: { 
				default: 10,
				validate: aval
			},
			setA: { value: function(val) { this.a = val }},
			b: { 
				default: 'b',
				validate: bval
			},
			setB: { value: function(val) { this.b = val }}
		},
	})
	let e
	t.doesNotThrow(function() {
		e = new fixtures.Example()
		t.equal(e.a, 10, `Default value set on a`)
		t.equal(e.b, 'b', `Default value set on b`)
		t.equal(acount, 1, `A validator called on initialization`)
		t.equal(bcount, 1, `B validator called on initialization`)
		e.setA(11)
		t.equal(acount, 2, `A validator called when a is set`)
		t.equal(bcount, 1, `B validator not called when only a is set`)
		e.setB('B')
		t.equal(acount, 2, `A validator not called only B when a is set`)
		t.equal(bcount, 2, `B validator called when B is set`)
		e.atomicSet(function() {
			this.setA(this.a + 1)
			this.setB(this.b + 'bee')
		})
		t.equal(acount, 3, `A validator called when A when a is set as part of atomic set`)
		t.equal(bcount, 3, `B validator called when B when a is set as part of atomic set`)
		t.equal(e.a, 12, `New A value assigned`)
		t.equal(e.b, 'Bbee', `New B value assigned`)

	}, `Exception not thrown because validator never throws`)

	t.end()
})

test(`validator gets no arguments`,(t) => {
	var valArgCnt = false
	var applyToArgCnt = false
	const fixtures = setup({
		Example: {
			a: { 
				validate: {
					applyTo: function() {
						applyToArgCnt = arguments.length 
						return this
					},
					validate: function() { 
						valArgCnt = arguments.length 
					},
				}
			}
		},
	})
	t.doesNotThrow(() => {
		let e = new fixtures.Example() // eslint-disable-line no-unused-vars
		t.equal(valArgCnt, 0, `Validator receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
		t.equal(applyToArgCnt, 0, `Validator receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
	}, `Exception not thrown because validator never throws`)
	t.end()
})

test(`Invalid initial value throws even if default value is valid`,(t) => {
	const msg = `a must be less than 10`
	const init = 42
	const dflt = 5
	const fixtures = setup({
		Example: { 
			a: { 
				default: dflt,
				validate: function() { if (this.a >= 10) throw new Error(msg) },
			}
		},
	})
	let e
	t.throws(() => {
		e = new fixtures.Example({a: init })
	}, new RegExp(msg), `Can't instantiate class with invalid intial value`)
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

test(`Validators can be a method of the object`, (t) => {
	const prop = 'myprop'
	const msg = `${prop} must be an int`
	const isNum = function() { 
		if (this[prop] === undefined) return
		if (!this[prop].toString().match(/^\d+$/)) throw new Error(msg) 
	}
	let objProps = {}
	const methodName = 'checkNum'
	objProps[prop] = { validate: methodName }
	objProps[methodName] = { value: isNum }
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

test(`Validation across related objects`, (t) => {
	const msg = `a must be less than 10`
	const aFirstVal = 10
	const aSecondVal = 9
	const fixtures = setup({
		A: {
			val: {
				enumerable: true,
				validate: {
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
	t.doesNotThrow(() => {
		a.val = aFirstVal
	}, `Assign valid value`)
	t.equal(a.val, aFirstVal, `Valid value assigned`)
	try {
		a.val = 11
		t.fail(`Validator throws an exception when an invalid value is assigned.`)
	} catch (e) {
		t.equal(e.message, msg, `Exception thrown is from validator`)
		if (checkDTException(t,e)) {
			t.equal(a.val, aFirstVal,`invalid value not assigned`)
		}
	}
	try {
		b.a.val = 12
		t.fail(`Validator throws an exception when an invalid value is assigned vai a reference.`)
	} catch (e) {
		t.equal(e.message, msg, `Exception thrown is from validator`)
		if (checkDTException(t,e)) {
			t.equal(b.a.val, aFirstVal, 'undefined',`invalid value not assigned`)
		}
	}
	t.doesNotThrow(() => {
		a.val = aSecondVal
	}, `Can assign valid value`)
	t.equal(a.val,aSecondVal,`Value correct after valid assignment`)
	t.equal(b.a.val,aSecondVal,`cross-references intact`)

	t.end()
})

test(`Validation across related objects using atomicSet()`, (t) => {
	var MAX = 10
	var valid = 0
	var invalid = MAX+1
	var msg = `"val" must be less than ${MAX}`
	var myObj, myOther
	t.doesNotThrow(() => {
		var schema = new DataTrue()
		var MyClass = schema.createClass({
			other: {}
		})
		var MyOtherClass = schema.createClass({
			val: { 
				default: valid,
				validate: function() { if (this.val > MAX) throw new Error(msg) }
			}
		})
		myOther = new MyOtherClass()
		myObj = new MyClass({other: myOther})
	}, `instantiate related objects`)
	t.throws(() => {
		myObj.atomicSet(function() {
			this.other.val = invalid
		})
	}, new RegExp(msg), `Validator throws when invalid value is set`)
	t.equal(myOther.val, valid, `Invalid value not set`)
	t.end()
})

test(`Atomic set with changes across related objects sets values for all objects`, (t) => {
	const adflt = 'abc'
	const adelta = 'def'
	const bdflt = 123
	const bdelta = 456
	const fixtures = setup({
		A: {
			aval: { default: adflt }, 
			b: { enumerable: true, },
		},
		B: {
			bval: { default: bdflt }, 
		},
	})

	var a, b
	try {
		a = new fixtures.A()
	} catch (e) {  
		t.fail(`Can instantiate test class 'A': ${e}`) 
		t.end()
		return
	}
	t.equal(adflt, a.aval, `Default value for aval set`)
	try {
		b = new fixtures.B() 
	} catch (e) {  
		t.fail(`Can instantiate test class 'B': ${e}`) 
		t.end()
		return
	}
	t.equal(bdflt, b.bval, `Default value for bval set`)
	a.b = b

	t.doesNotThrow(() => {
		a.atomicSet(function() {
			this.aval = adelta
			this.b.bval = bdelta
		})
	},`Atomic set does not throw errors`)
	t.equal(adelta, a.aval, `aval changed`)
	t.equal(bdelta, b.bval, `bval changed`)
	
	t.end()
})


test(`Instantiate interdependent objects`,(t) => {
	const schema = new DataTrue()
	const aMsg = `a is not an A`
	const bMsg = `b is not a B`
	const aType = 'aaa'
	const bType = 'bbb'
	const A = schema.createClass({
		b: {
//			validate: function() { if (!(B.isPrototypeOf(this.b))) throw new Error(aMsg) }
			validate: function() { if (typeof this.b !== 'object' || this.b.mytype !== bType) throw new Error(bMsg) }
		},
		mytype: { value: aType },
	})
	const B = schema.createClass({
		a: {
//			validate: function() { if (!(A.isPrototypeOf(this.a))) throw new Error(`${bMsg}: ${this.a}`) }
			validate: function() { if (typeof this.a !== 'object' || this.a.mytype !== aType) throw new Error(aMsg) }
		},
		mytype: { value: bType },
	})

	let a
	t.throws(() => {
		a = new A()
	}, new RegExp(bMsg), `Can't instantiate an A without a B`)
	t.equal(typeof a,'undefined',`a is not defined`)
	t.throws(() => {
		let b = new B() // eslint-disable-line no-unused-vars
	}, new RegExp(aMsg), `Can't instantiate a B without an A`)
	t.equal(typeof b,'undefined',`b is not defined`)

	let inita = {}
	let initb = {}
	initb[schema.dtprop] = B
	initb.a = inita
	inita.b = initb
	a = false
	t.doesNotThrow(() => {
		a = new A(inita)
	}, `Can create related objects at once`)
	if (a) {
		t.assert(a.b instanceof B, `Datatrue object b instantiated`)
		t.assert(a.b.a === a, `dataTrue objects correctly link`)
	}

	t.end()
})

// TODO: Arguments are passed to user's constructor ?

/*
const after = test
after('after', (assert) => {
	assert.pass('Do something after')
	assert.end()
})
*/
