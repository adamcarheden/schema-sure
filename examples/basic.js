var DataTrue = require('./DataTrue').default
// JavaScript/ES5 users: Sorry about the 'default' nonsense. It's the ES6/ES2015/Babel way to doing things

// DataTrue is a schema for your data similar to constraints in SQL
var schema = new DataTrue()

// Define your DataTrue classes similar to how you might use JavaScript's Object.create()
var MyClass = schema.createClass('MyClass', {
	'myValue': {
		validate: function() {
			var num = parseInt(this.myValue)
			if (isNaN(num)) throw new Error("'"+this.myValue+"' is not a number")
			if (num < 1 || num > 10) throw new Error("'"+this.myValue+"' is not between 1 and 10")
		}
	}
})
var firstArg = process.argv[2]
try {
	// Pass an initial set of values to your objects
	// Validation runs as soon as those are set, so if your initial state doesn't pass your validation rules
	// the object will throw an exception instead of being instantiated
	var myObject = new MyClass({myValue: firstArg})
	console.log(`'${myObject.myValue}' /is/ between 0 and 10`)
} catch(e) {
	console.log(e.message)
	throw e
}
