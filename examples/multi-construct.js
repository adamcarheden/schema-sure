// This example shows how to enforce a constraint across multiple values that span multiple objects
var MIN = 0
var MAX = 4
var inRange = function() {
	var sum = this.sum() + this.relObj.sum()
	if (sum < MIN || sum > MAX) throw new Error('The sum of all values must be between '+MIN+' and '+MAX)
} 

var DataTrue = require('../DataTrue').default
var schema = new DataTrue()

var ClassA = schema.createClass(

	// Define properties and validation for your class, similar to JavaScript's Object.create()
	{
		valA: {
			// 'validate' and 'default' a DataTrue-specific. JavaScripts Object.create() doesn't have them

			// validate is an array of validation functions.
			// Members may be funcion objects or the name of a method of the class
			validate: [
				function() { if (isNaN(this.valA)) throw new Error("'"+this.myValue+"' isn't an integer") },
				'inRange',
			],

			// If you have a validator, you may not define the 'value' key as you do with Object.create
			// To set an initial value, use 'default' instead.
			default: 0, // valA will default to 1 unless the user passes a value for it when calling 'new MyClass()'

			// 'get' and 'set' work differently than JavaScript's Object.create()
			// They don't circumvent reading and assigning values but instead act
			// as hooks to munge values before they're returned to the user or 
			// stored in the object.
			// To get Object.create()'s behavior instead, create a class that defines the 
			// property using Object.create() and make it the prototype of your DataTrue class.
			get: function(realValue) {
				// This is called on the realValue stored by DataTrue.
				// You could use it to do something like format a number 
				return realValue
			},
			set: function(assignedData) {
				// This is called on the data assigned to the property before it's set on the object
				return parseInt(assignedData)
			},

			// Everything else is the same as JavaScript's Object.create()
			configurable: false,
			enumerable: true, // Default's to false, just as in Object.create()
			writable: false,
		},

		valB: {
			// By using the same validation function on multiple values, it will only be 
			// called only when valA and valB are set at the same time (see atomic set below).
			// You can use the same function either by using the name of a method of the class
			// or by using a reference to the function as below.
			validate: inRange,
			// If you only have one validation function, 'validate' need not be an array
			// Here we've neglected to validate that parseInt in 'set' below didn't return NaN 
			// in order to demonstrate this

			set: { function (data) { return parseInt(data) }}
		},

		// Methods are defined the same as when using using Object.create()
		sum: { value: function() { return this.valA + this.valB }},

		// Methods of your class may be used as validation functions
		inRange: { value: inRange },

		relObj: {
			validate: function() { if (this.bObj.type !== 'B') throw new Error('relObj must be an instance of ClassB') }
		},
	},
	false, // No constructor necessary
	// The prototype of your class
	Object.create(Object.prototype, { type: { get: function() { return 'A' }}})
)

var makeInt = function(data) { return parseInt(data) }
var ClassB = schema.createClass(
	{
		valC: {
			validate: [
				function() {
					if (isNaN(this.valC)) throw new Error('valC must be an integer') 
				},
				{
					validate: inRange,
					// Validator functions are called once per object/function pair
					// By always calling inRange on the A object it will only be called once,
					// no matter how many of the values it's assigned to are modified
					applyTo: function() { return this.aObj }
				}
			],
			set: makeInt
		},
		valD: {
			validate: [
				function() {
					if (isNaN(this.valD)) throw new Error('valD must be an integer') 
				},
				{
					validate: inRange,
					applyTo: function() { return this.aObj }
				}
			],
			set: makeInt
		},
	
		sum: { value: function() { return this.valC + this.valD } },
		relObj: {
			validate: function() { if (this.aObj.type !== 'A') throw new Error('relObj must be an instance of ClassA') }
		},
	},
	false, // No constructor necessary
	// The prototype of your class
	Object.create(Object.prototype, { type: { get: function() { return 'B' }}})

)

var aInit = {valB: 0}
var bInit = {valC: 0, valD: 0}
bInit[schema.dtprop] = ClassB
aInit.relObj = bInit
bInit.relObj = aInit
var aObj = new ClassA(aInit)
var bObj = aObj.relObj
schema.set(aObj,function() {
	aObj.valA = 1
	aObj.valB = 1
	bObj.valC = 1
	bObj.valD = 1
})
