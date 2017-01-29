var SchemaSure = require('./SchemaSure').default
var schema = new SchemaSure()

var NonSSClass = function() {}
NonSSClass.prototype = Object.create(Object.prototype, { 
	parentValue: { 
		get: function() { return 'parent' }
	}}
)

var ClassA = schema.createClass(
	// A name (Required for planned future serialization/deserialization feature)
	'ClassA',

	// Your Object Definition
	{ myValue: {} },

	// Your constructor runs after SchemaSure has assigned values to the object
	// It receives an argument array with the first argument to 'new Class(...)' shifted out
	function(initVals, arg2, arg3) { 
		this.myValue += arg2 + arg3
	},

	// The prototype of your class
	NonSSClass.prototype
)

var a = new ClassA(
	{ myValue: 1 }, // Initializaion values. SchemaSure assigns these for you
	2,              // arg2
	3               // arg3
	// You can pass as many additional values as you like
)
console.log(a.myValue)     // 6
console.log(a.parentValue) // parent
