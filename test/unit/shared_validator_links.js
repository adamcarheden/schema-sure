const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`Errors from shared validators linked to all objects and properties that share them, even those properties that don't change (${Path.basename(__filename)})`, (t) => {
	let msg = 'fail'
	let fail = false
	let oldval = 'one'
	let newval = 'three'
	let staticval = 'two'
	let v = function() { if (fail) throw new Error(msg) }
	const fixtures = setup({ Example: { 
		valA: { validate: {'aval': v}},
		valB: { validate: {'bval': v}},
	}})
	var ex = false
	var obj = false
	t.doesNotThrow(() => {
		obj = new fixtures.Example({ valA: oldval, valB: staticval }) // eslint-disable-line no-unused-vars 
	},'Can instantiate')
	fail = true
	try {
		obj.valA = newval
		t.fail(`Validator called when valA set`)
	} catch(e) {
		ex = e
	}
	t.assert('AtomicSetError' in ex, `Throws AtomicSetError`) // becuase instanceof is just broken
	t.equal(obj.valA, oldval, `value not assigned if validator fails`)
	t.equal(obj.valB, staticval, `value not assigned if validator fails`)
	t.assert(ex.exceptions.has(obj), `Exception assigned to object`) 
	var oex = ex.exceptions.get(obj)
	if ('valA' in oex) {
		t.assert('aval' in oex.valA, `Exception name aval assigned for valA`)
	} else {
		t.fail(`Exception assigned for valA`)
	}
	if ('valB' in oex) {
		t.assert('bval' in oex.valB, `Exception name bval assigned for valB`)
	} else {
		t.fail(`Exception assigned for valB`)
	}
	t.end()
})

