import {
	test, setup
} from './fixtures.js'

test(`User constructor`, (t) => {
	const fixtures = setup({})
	let arg = 'abc'
	const MyClass = fixtures.schema.createClass('MyClass', {
		val: {},
	}, function() {
		t.equal(arguments.length,2,`1 argument passed to constructor`)
		t.equal(arguments[1],arg,`argument has correct value`)
		this.val = arg
	})
	t.doesNotThrow(function() {
		let obj = new MyClass({},arg)
		t.equal(obj.val, arg,`user constructor was called`)
	},`Can instantiate object`)
	t.end()
})
