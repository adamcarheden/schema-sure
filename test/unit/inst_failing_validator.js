import {
	test, setup,
	checkDTException, getEx
} from './fixtures.js'

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
