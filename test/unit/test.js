import test from 'tape'
import DataTrue, { AtomicSetError, Validator } from '../../src/DataTrue'

const setup = (classes) => {
	const schema = new DataTrue()
	var fixtures = {
		DataTrue: DataTrue,
		schema: schema,
	}
	Object.keys(classes).forEach((name) => {
		fixtures[name] = schema.createClass(name, classes[name])
	})
	return fixtures
}

const checkDTException = function(t, ex, expect) {
	if (!(ex instanceof Error)) {
		t.fail(`Test infrastructure: Error object passed to checkDTException is an Error`)
		return false
	}
	if (ex instanceof AtomicSetError) {
		t.fail(`Error thrown by DataTrue is an AtomicSetError: ${ex}\n${ex.stack}`)
		return false
	}
	if (!('exceptions' in ex)) {
		t.fail(`AtomicSetError has an exceptions property`)
		return false
	}
	if (!(ex.exceptions instanceof Map)) {
		t.fail(`The exceptions property of AtomicSetError is a Map`)
		return false
	}
	let keys = ex.exceptions.keys()
	if (keys.length >= 1) {
		t.fail(`AtomicSetError.exceptions isn't empty`)
		return false
	}
	var ok = true
	ex.exceptions.forEach((v,ko) => {
		if (typeof ko !== 'object') {
			t.fail(`All AtomicSetError exception keys are objects`)
			ok = false
		}
		let failTmpl = false
		if (expect) {
			if (expect instanceof Map) {
				if (expect.has(ko)) {
					failTmpl = expect.get(ko)
				} else {
					t.fail(`Object was invalid`)
					ok = false
				}
			} else {
				failTmpl = expect
			}
		}
		if (typeof v !== 'object') {
			t.fail(`All AtomicSetError exception values are objects`)
			ok = false
		}
		Object.keys(failTmpl).forEach(function(value) {
			if (!(value in v)) {
				t.fail(`Exception should be thrown for value '${value}'`)
				ok = false
			} else {
				t.comment(`Exception thrown for '${value}' as expected`)
			}
		})
		Object.keys(v).forEach(function(value) {
			if (typeof v[value] !== 'object') {
				t.fail(`Exceptions for value '${value}' is an object`)
				ok = false
				return
			}
			let vnames
			if (failTmpl) {
				if (!(value in failTmpl)) {
					t.fail(`No exception should have been thrown for value '${value}'`)
					ok = false
				} else {
					vnames = failTmpl[value]
					t.comment(`Expected an exception for '${value}' (and we got one)`)
				}
			}
			let cnt = 0
			if (vnames) {
				Object.keys(vnames).forEach(function(vname) {
					if (vname in v[value]) {
						t.comment(`Validator '${vname}' of property '${value}' threw an exception as expected`)
					} else {
						t.fail(`Validator '${vname}' of property '${value}' should an exception`)
						ok = false
					}
				})
			}
			Object.keys(v[value]).forEach(function(vname) {
				if (vnames) {
					if (vname in vnames) {
						t.comment(`Validator '${vname}' for property '${value}' threw an exception as expected`)
					} else {
						t.fail(`Validator '${vname}' for property '${value}' should not throw an exception`)
						ok = false
					}
				} else if (++cnt > 1) {
					t.fail(`Multiple validators, including '${vname}', threw exceptions for property '${value}'. Expecting just 1`)
					ok = false
				}
				if (!(v[value][vname] instanceof Error)) {
					t.fail(`The thing thrown by validator '${vname}' of value '${value}' is of type Error`)
					ok = false
					return
				}
			})
		})
	})
	return ok
}
const getEx = function(t, e, prop) {
	let c1 = 0
	let ex = false
	e.exceptions.forEach((v, ko) => {
		if (++c1 !== 1) {
			t.fail(`Exceptions thrown for just one object`)
			return
		}
		if (prop in v) {
			let c2 = 0
			Object.keys(v[prop]).forEach(function(k) {
				if (++c2 !== 1) {
					t.fail(`Expect one exception to be thrown for property '${prop}'`)
					return
				}
				ex = v[prop][k]
			})
		} else {
			t.fail(`Expect exceptions to be thrown for property '${prop}'`)
			return
		}
	})
	return ex
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
	if (e) t.equal(e.a,a,`Initial values are set correctly`)
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

test(`Valid initial values does not throw`, (t) => {
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

test(`Default values are set`,(t) => {
	const a = 42
	const fixtures = setup({
		Example: { a: { default: a }}
	})
	let e
	t.doesNotThrow(() => {
		e = new fixtures.Example()
	}, `Can instantiate class with default values`)
	if (e) t.equal(e.a,a,`e.a has default value`)
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
	if (e) t.equal(e.a,init,`e.a has initial value`)
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
	if (e) t.equal(e.a,dflt,`e.a has correct default value`)
	t.end()
})

// TODO: test all the different ways to set a validator: string, function, new Validator * ( unnamed, multiple named )


test(`Set unmanaged property`, (t) => {

	const fixtures = setup({
		Example: {},
	})
	let ex
	t.doesNotThrow(() => {
		ex = new fixtures.Example()
	},`Can instantiate empty class`)
	t.equal(typeof ex.a, 'undefined', `Unmanaged property not defined yet`)
	t.notOk('a' in ex, `Unmanaged property not defined yet`)
	let aval = 10
	t.doesNotThrow(function() {
		ex.atomicSet(() => {
			ex.a = aval
		})
	},`Can set unmanaged property using atomic set`)
	t.equal(ex.a, aval, `Unmanaged property was set in atomic set`)
	
	t.equal(typeof ex.b, 'undefined', `Unmanaged property not defined yet`)
	t.notOk('b' in ex, `Unmanaged property not defined yet`)
	let bval = 'abcd'
	ex.b = bval
	t.equal(ex.b, bval, `Unmanaged property was set directly on object`)

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
			e.a++
			e.b += 'bee'
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
		var MyClass = schema.createClass('MyClass', {
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
		t.equal(obj.valA, init, `invalid value for A is not set`)
		t.equal(obj.valB, init, `invalid value for B is not set`)
	}, new RegExp(msg), `setting invalid intermediate value without atomicSet fails`)

	t.throws(function() {
		obj.atomicSet(function() {
			obj.valA = MAX
			obj.valB = MAX
		})
		t.equal(obj.valA, init, `atomicSet() prevents invalid A value from being set`)
		t.equal(obj.valB, init, `atomicSet() prevents invalid B value from being set`)
	}, new RegExp(msg), `setting invalid values with atomicSet fails`)

	t.doesNotThrow(function() {
		obj.atomicSet(function() {
			obj.valA = 6
			obj.valB = 4
		})
		t.equal(obj.valA, 6, `A is correct after atomicSet()`)
		t.equal(obj.valB, 4, `B is correct after atomicSet()`)
	}, `setting invalid intermediate values with atomicSet does not fail`)

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
			e.setA(e.a + 1)
			e.setB(e.b + 'bee')
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
	}, `Exception not thrown because validator never throws`)
	t.equal(valArgCnt, 0, `Validator receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
	t.equal(applyToArgCnt, 0, `ApplyTo receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
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
	t.equal(typeof e, 'undefined', `e should be undefiend because it's constructor threw`)
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
	
	let example
	try {
		example = new fixtures.Example() // eslint-disable-line no-unused-vars
		t.fail(`Instantiated class with validator that always throws an exception. That shouldn't be possible. Validators probably aren't running.`)
	} catch(e) {
		t.assert(typeof example === 'undefined',`Instantiating class with failing validator fails`)
		let expect = {}
		expect[prop] = undefined
		if (checkDTException(t, e, expect)) {
			let ex = getEx(t,e,prop)
			t.equal(ex.message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(e.message, msg, `Message for AtomicSetError should be '${msg}'`)
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
		t.equal(example[prop], val, `Value passed to constructor should be assigned to appropriate property`)
	}, 'Instantiate a class with a validated property and a valid value should not throw an exception')
	try {
		example[prop] = 'abc'
		t.fail(`Expected exception when setting invalid value`)
	} catch (e) {
		t.equal(example[prop], val, `Invalid value should NOT be assigned to property`)
		let expect = {}
		expect[prop] = undefined
		if (checkDTException(t,e, new Map([[example, expect]]))) {
			let ex = getEx(t,e,prop)
			t.equal(ex.message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(e.message, msg, `Message for AtomicSetError should be '${msg}'`)
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
		let expect = {}
		expect[prop] = undefined
		if (checkDTException(t,e, new Map([[example,expect]]))) {
			let ex = getEx(t,e,prop)
			t.equal(e.message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(ex.message, msg, `Message should be '${msg}'`)
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
	let example
	t.doesNotThrow(function() {
		example = new fixtures.Example({})
	})
	try {
		example.atomicSet(() => {
			example.numprop = 'abc'
			example.alphaprop = 123
		})
		t.fail(`Expected exception when setting invalid values`)
	} catch (e) {
		const msgs = {
			numprop: '\'abc\' isn\'t a number',
			alphaprop: '\'123\' isn\'t letters',
		}
		let expect = new Map()
		expect.set(example, {
			numprop: undefined,
			alphaprop: undefined
		})
		if (checkDTException(t,e, expect)) {
			Object.keys(msgs).forEach(function(prop) {
				var ex = e.getExceptionsFor(example, prop, false)
				t.assert(ex, `Expect an exception for '${prop}'`)
				t.equal(ex.length, 1, `Should throw exactly 1 exception for '${prop}'`)
				t.equal(ex[0].message, msgs[prop], `Message for '${prop}' should be '${msgs[prop]}'`)
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
	let example
	t.doesNotThrow(function() {
		example = new fixtures.Example({})
	},`Can instantiate class without values`)
	try {
		example.numprop = 123
		example.alphaprop = 123
		t.fail(`Expected exception when setting invalid values`)
	} catch (e) {
		let alphapropmsg = '\'123\' isn\'t letters'
		let expect = new Map()
		expect.set(example, {
			alphaprop: undefined
		})
		if (checkDTException(t,e, expect)) {
			var ex = e.getExceptionsFor(example, 'alphaprop', false)
			t.assert(ex,`Setting alphaprop threw an exception`)
			t.equal(ex.length, 1 , `Should throw exactly 1 exception for alphaprop`)
			t.equal(ex[0].message, alphapropmsg , `Message for alphaprop should be '${alphapropmsg}'`)
			t.equal(e.message, alphapropmsg , `Message for AtomicSetError should be '${alphapropmsg}'`)
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
	t.equal(x, 1, `Shared validator function was called exactly once`)
	t.end()
})

test(`Validation across unrelated objects using atomicSet()`, (t) => {
	const msg = 'val must be > 10'
	const vfun = function() { if (this.val > 10) throw new Error(msg) }
	const fixtures = setup({
		A: { val: { validate: vfun, default: 0 }},
		B: { val: { validate: vfun, default: 0 }},
	})

	let a, b
	t.doesNotThrow(function() {
		a = new fixtures.A()
		b = new fixtures.B()
	})
	try {
		fixtures.schema.atomicSet(function() {
			a.val = 11
			b.val = 12
		})
		t.fail(`Setting invalid values throws an exception`)
	} catch (e) {
		t.equal(a.val, 0, `Invalid value was not set on a`)
		t.equal(b.val, 0, `Invalid value was not set on b`)
		let expect = new Map([
			[a,{val: undefined}],
			[b,{val: undefined}],
		])
		if (checkDTException(t,e, expect)) {
			let aex = e.getExceptionsFor(a,'val',false)
			t.equal(aex.length,1,`Exactly one exception throw for a.val`)
			t.equal(aex[0].message,msg,`Exception thrown for object 'a'`)
			let bex = e.getExceptionsFor(b,'val',false)
			t.equal(bex.length,1,`Exactly one exception throw for b.val`)
			t.equal(bex[0].message,msg,`Exception thrown for object 'b'`)
		}
	}

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
				validate: new Validator(
					// Validator
					function() {
						if (typeof this.a === 'object' && typeof this.a.val !== 'undefined' && this.a.val > 10) throw new Error(msg)
					},
					// Apply to b
					function() { 
						return (typeof this.b === 'undefined') ? false : this.b 
					}
				)
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
		var MyClass = schema.createClass('MyClass', {
			other: {}
		})
		var MyOtherClass = schema.createClass('MyOtherClass', {
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
			myObj.other.val = invalid
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
			a.aval = adelta
			a.b.bval = bdelta
		})
	},`Atomic set does not throw errors`)
	t.equal(adelta, a.aval, `aval changed`)
	t.equal(bdelta, b.bval, `bval changed`)
	
	t.end()
})

// TODO: test instantiating using the string name of a class instead of it's constructor object
test(`Instantiate interdependent objects`,(t) => {
	const schema = new DataTrue()
	const aMsg = `a is not an A`
	const bMsg = `b is not a B`
	const aType = 'aaa'
	const bType = 'bbb'
	const A = schema.createClass('A', {
		b: {
//			validate: function() { if (!(B.isPrototypeOf(this.b))) throw new Error(aMsg) }
			validate: function() { if (typeof this.b !== 'object' || this.b.mytype !== bType) throw new Error(bMsg) }
		},
		mytype: { value: aType },
	})
	const B = schema.createClass('B', {
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
	initb[schema.dtProp] = B
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

test(`User constructor`, (t) => {
	const fixtures = setup({})
	let arg = 'abc'
	const MyClass = fixtures.schema.createClass('MyClass', {
		val: {},
	}, function() {
		t.equal(arguments.length,2,`1 argument passed to constructor`)
		t.equal(arguments[1],arg,`argument has correct value`)
		this.val = arg
	})
	t.doesNotThrow(function() {
		let obj = new MyClass({},arg)
		t.equal(obj.val, arg,`user constructor was called`)
	},`Can instantiate object`)
	t.end()
})

test(`Subclassing`, (t) => {
	const fixtures = setup({})
	let gmsg = `gval must be > 10`
	let pmsg = `pval must be > 10`
	let cmsg = `cval must be > 10`
	let gdfl = 0
	let pdfl = 1
	let cdfl = 2
	let gvalid = 3
	let pvalid = 4
	let cvalid = 5
	let gcall = 0
	let pcall = 0
	let ccall = 0
	const Gramps = fixtures.schema.createClass('Gramps', {
		gval: {
			validate: function() {
				gcall += 1
				if (this.gval > 10) throw new Error(gmsg)
			},
			default: gdfl,
		}
	})
	const Parent = fixtures.schema.createClass('Parent', {
		pval: {
			validate: function() {
				pcall += 1
				if (this.pval > 10) throw new Error(pmsg)
			},
			default: pdfl,
		},
		cval: {
			validate: function() {
				if (this.cval < 10) throw new Error(`Parent cval called. That should't happen`)
			},
			default: 42,
		}
	},undefined,Gramps.prototype)
	const Child = fixtures.schema.createClass('Child', {
		cval: {
			validate: function() {
				ccall += 1
				if (this.cval > 10) throw new Error(cmsg)
			},
			default: cdfl,
		}
	},undefined,Parent.prototype)
	// TODO: Add non-dt class somewhere in the middle

	let obj
	t.doesNotThrow(function() {
		obj = new Child()
	})
	t.assert(obj instanceof Child,`Object is an instance of Child`)
	t.assert(obj instanceof Parent,`Object is an instance of Parent`)
	t.assert(obj instanceof Gramps,`Object is an instance of Gramps`)
	t.assert('cval' in obj,`Object has a cval`)
	t.assert('pval' in obj,`Object has a pval`)
	t.assert('gval' in obj,`Object has a gval`)
	t.equal(obj.cval, cdfl, `Child object default value set`)
	t.equal(obj.pval, pdfl, `Parent object default value set`)
	t.equal(obj.gval, gdfl, `Grandparent object default value set`)
	t.equal(ccall,1,`Child validator called at init`)
	t.equal(pcall,1,`Parent validator called at init`)
	t.equal(gcall,1,`Gramps validator called at init`)
	t.throws(function() {
		obj.cval = 11
	},new RegExp(cmsg),`Invalid child value throws`)
	t.equal(obj.cval,cdfl,`Invalid child value not set`)
	t.equal(ccall,2,`Child validator called for invalid value`)
	t.throws(function() {
		obj.pval = 11
	},new RegExp(pmsg),`Invalid child value throws`)
	t.equal(obj.pval,pdfl,`Invalid parent value not set`)
	t.equal(pcall,2,`Parent validator called for invalid value`)
	t.throws(function() {
		obj.gval = 11
	},new RegExp(gmsg),`Invalid gramps validator throws`)
	t.equal(obj.gval,gdfl,`Invalid grandparent value not set`)
	t.equal(gcall,2,`Gramps validator called for invalid value`)
	t.doesNotThrow(function() {
		obj.cval = cvalid
	},`Valid child value does not throw`)
	t.equal(obj.cval,cvalid,`Valid child value set`)
	t.equal(ccall,3,`Child validator called for valid value`)
	t.doesNotThrow(function() {
		obj.pval = pvalid
	},`Valid parent value does not throw`)
	t.equal(obj.pval,pvalid,`Valid parent value set`)
	t.equal(pcall,3,`Parent validator called for valid value`)
	t.doesNotThrow(function() {
		obj.gval = gvalid
	},`Valid gramps value does not throw`)
	t.equal(obj.gval,gvalid,`Valid gramps value set`)
	t.equal(gcall,3,`Gramps validator called for valid value`)

	t.end()
})

