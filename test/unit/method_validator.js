import {
	test, setup,
	checkDTException, getEx
} from './fixtures.js'

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
