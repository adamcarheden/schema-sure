const Path = require('path')
import {
	test, setup,
	Validator, checkSSException
} from './fixtures.js'

test(`Validation across related objects (${Path.basename(__filename)})`, (t) => {
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
		if (checkSSException(t,e)) {
			t.equal(a.val, aFirstVal,`invalid value not assigned`)
		}
	}
	try {
		b.a.val = 12
		t.fail(`Validator throws an exception when an invalid value is assigned vai a reference.`)
	} catch (e) {
		t.equal(e.message, msg, `Exception thrown is from validator`)
		if (checkSSException(t,e)) {
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
