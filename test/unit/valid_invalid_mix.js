import {
	test, setup,
	checkDTException
} from './fixtures.js'

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
