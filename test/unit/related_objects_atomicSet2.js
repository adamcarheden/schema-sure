import {
	test, setup,
} from './fixtures.js'

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
