import {
	test, setup,
} from './fixtures.js'

test(`Set unmanaged property`, (t) => {

	const fixtures = setup({
		Example: {},
	})
	let ex
	t.doesNotThrow(() => {
		ex = new fixtures.Example()
	},`Can instantiate empty class`)
	t.equal(typeof ex.a, 'undefined', `Unmanaged property not defined yet`)
	t.notOk('a' in ex, `Unmanaged property not defined yet`)
	let aval = 10
	t.doesNotThrow(function() {
		ex.atomicSet(() => {
			ex.a = aval
		})
	},`Can set unmanaged property using atomic set`)
	t.equal(ex.a, aval, `Unmanaged property was set in atomic set`)
	
	t.equal(typeof ex.b, 'undefined', `Unmanaged property not defined yet`)
	t.notOk('b' in ex, `Unmanaged property not defined yet`)
	let bval = 'abcd'
	ex.b = bval
	t.equal(ex.b, bval, `Unmanaged property was set directly on object`)

	t.end()
})
