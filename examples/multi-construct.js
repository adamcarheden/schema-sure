var SchemaSure = require('./SchemaSure').default
var Validator = require('./SchemaSure').Validator
var schema = new SchemaSure()


var MAX = 10
var checkMax = function() { 
	if (!(this.bobj instanceof ClassB)) throw new Error('bobj must be a ClassB')
	if (this.val + this.bobj.val > MAX) throw new Error('sum must not exceed '+MAX)
}
var ClassA = schema.createClass('ClassA',{
	bobj: { validate: checkMax },
	val: { default: 5, validate: checkMax },
})
var ClassB = schema.createClass('ClassB',{
	aobj: {
		validate: function() { if (!(this.aobj instanceof ClassA)) throw new Error('aobj must be a ClassA') }
	},
	val: { 
		default: 5, 
		validate: new Validator(checkMax, function() {
			if (!(this.aobj instanceof ClassA)) throw new Error('aobj must be a ClassA')
			return this.aobj
		}
	)}
})

var ainit = {}
var binit = { 
	// The reserved property name 'SchemaSure' tells us to pass binit to the constructor of another SchemaSure class
	// It can be either the constructor (as returned by schemaSure.createClass()) or 
	// the class name (first argument to schemaSure.createClass())
	SchemaSure: ClassB,
	aobj: ainit
}
ainit.bobj = binit // Create a circular reference

// This does NOT throw an exception.
// A ClassB is instantiated for you by the ClassA constructor and assigned to a.bobj.
var a = new ClassA(ainit)

try {
	a.val = 6
} catch(e) {
	console.log(e.message) // prints 'sum must not exceed 10' because 6 + 5 (the default value for ClassB.val) is 11
}
