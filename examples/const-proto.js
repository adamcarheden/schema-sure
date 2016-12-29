var DataTrue = require('./DataTrue').default
var schema = new DataTrue()

var NonDTClass = function() {}
NonDTClass.prototype = Object.create(Object.prototype, { 
	parentValue: { 
		get: function() { return 'parent' }
	}}
)

var ClassA = schema.createClass(
	// Your Object Definition
	{ myValue: {} },

	// Your constructor runs after DataTrue has assigned values to the object
	// It receives an argument array with the first argument to 'new Class(...)' shifted out
	function(arg2, arg3) { 
		this.myValue += arg2 + arg3
	},

	// The prototype of your class
	NonDTClass.prototype
)

var a = new ClassA(
	{ myValue: 1 }, // Values DataTrue assigns for you
	2,              // First argument to your constructor
	3               // Second argument to your constructor
	// You can pass as many additional values as you like
)

console.log(a.myValue)     // Prints '6'
console.log(a.parentValue) // Prints 'parent'
