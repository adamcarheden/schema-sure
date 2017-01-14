import {
	test, setup,
} from './fixtures.js'

test(`validator gets no arguments`,(t) => {
	var valArgCnt = false
	var applyToArgCnt = false
	const fixtures = setup({
		Example: {
			a: { 
				validate: {
					applyTo: function() {
						applyToArgCnt = arguments.length 
						return this
					},
					validate: function() { 
						valArgCnt = arguments.length 
					},
				}
			}
		},
	})
	t.doesNotThrow(() => {
		let e = new fixtures.Example() // eslint-disable-line no-unused-vars
	}, `Exception not thrown because validator never throws`)
	t.equal(valArgCnt, 0, `Validator receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
	t.equal(applyToArgCnt, 0, `ApplyTo receives no arguments because the return value of each object/function combination must be always be the same for any given object/function pair`)
	t.end()
})
