const Path = require('path')
import {
	test, setup,
	checkSSException, getEx
} from './fixtures.js'

test(`Setting an invalid value should throw an exception and NOT change the value (${Path.basename(__filename)})`, (t) => {
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
		if (checkSSException(t,e, new Map([[example, expect]]))) {
			let ex = getEx(t,e,prop)
			t.equal(ex.message, msg , `Message for '${prop}' should be '${msg}'`)
			t.equal(e.message, msg, `Message for AtomicSetError should be '${msg}'`)
		}
	}
	t.end()
})
