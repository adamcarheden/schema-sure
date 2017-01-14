import {
	test,
	DataTrue
} from './fixtures.js'

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
