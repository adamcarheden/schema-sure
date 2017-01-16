const Path = require('path')
import {
	test, setup,
} from './fixtures.js'

test(`All validators are called on properties with multiple validators (${Path.basename(__filename)})`, (t) => {
	var v1 = 0
	var v2 = 0
	var objProps = {
		myprop: { validate: [
			function() { v1 += 1 },
			function() { v2 += 1 },
		]},
	}
	const fixtures = setup({ Example: objProps })
	try {
		let example = new fixtures.Example({})  // eslint-disable-line no-unused-vars
		t.equal(v1, 1, `First validator was called`)
		t.equal(v2, 1, `Second validator was called`)
	} catch (e) {
		t.fail(`Instantianting a class with multiple validators on a single property should not throw an exception`)
	}
	
	t.end()
})
