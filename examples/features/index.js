var DataTrue = require('../../../DataTrue').default;
var schema = new DataTrue(

	// DataTrue adds a non-enumerable property to your class to store it's internal data
	// By default, it's called 'DataTrue', but you can change that here.
	dtprop: 'DataTrue',

	// You can specify methods of your class as the validator
	// These will be read-only properties of your object so you can't overwrite them.
	// Setting this to true lets you make methods used as validators writable.
	// Hint: That's a bad idea. Don't do it.
	writableValidatorMethods: false,

	// Same as writableValidatorMethods, but for configurable.
	// See documentation for JavaScript's Object.defineProperties()
	configurableValidatorMethods: false	
)

var MyClass = schema.createClass(

	// Define properties and validation for your class, similar to JavaScript's Object.create()
	{
		myValue: {
			// 'validate' and 'default' a DataTrue-specific. JavaScripts Object.create() doesn't have them

			validate: function() { if (isNaN(this.myValue)) throw new Error("'"+this.myValue+"' isn't an integer"); },
			default: 1, // myValue will default to 1 unless the user passes a value for it when calling 'new MyClass()'

			// If you have a validator, you may not define a value. 
			// To set an initial value, use 'default' instead.
			// value: ...

			// 'get' and 'set' work differently than JavaScript's Object.create()
			// They don't circumvent reading and assigning values but instead act
			// as hooks to munge values before they're returned to the user or 
			// stored in the object.
			// To get Object.create()'s behavior instead, create a class that defines the 
			// property using Object.create() and make it the prototype of your DataTrue class.
			get: function(realValue) {
				// This is called on the realValue stored by DataTrue.
				// You could use it to do something like format a number 
				return realValue;
			},
			set: function(assignedData) {
				// This is called on the data assigned to the property before it's set on the object
				return parseInt(assignedData);
			},

			// Everything else is the same as JavaScript's Object.create()
			configurable: false,
			enumerable: false,
			writable: false,
		}

		// Methods are defined the same as when using using Object.create()
		myMethod: { value: function() { return this.myValue; }}

	}

	// Your constructor
	function(arg2) { 
		// This function will run after DataTrue sets initial values
		// Initial values are passed as the first argument to 'new MyClass()',
		// so your constructor gets a shifted argument array
	},

	// The prototype of your class
	Object.prototype,

);
