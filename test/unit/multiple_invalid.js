import {
	test, setup,
	checkDTException
} from './fixtures.js'

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
