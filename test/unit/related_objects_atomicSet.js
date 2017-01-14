import {
	test,
	DataTrue
} from './fixtures.js'

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
