# data-true

DataTrue is a framework for ensuring a set of related JavaScript objects are always in a valid state where "valid" is defined by a set of functions you specify. Think of it sort of like constrains and trigger in SQL, but for JavaScript objects.

> DataTrue is ready for cautious production use, but has not had extensive real-world testing. See _Current Status_ below for details.

## Usage

### Basic

#### In the Browser
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Data True Basic Browser Example</title>
<script src='../../../DataTrue.js'></script>
<script>
	var DataTrue = window['DataTrue'].default
	// JavaScript/ES5 users: Sorry about the 'default' nonsense. It's the ES6/ES2015/Babel way to doing things

	// DataTrue is similar to a schema for your data.
	// All classes you plan to associate with each other should be created from the same instance of DataTrue 
	var schema = new DataTrue()

	// Define your DataTrue classes similar to how you might use JavaScript's Object.create()
	var MyClass = schema.createClass({
		'myValue': {
			validate: function() {
				if (typeof this.myValue === 'undefined') return
				var num = parseInt(this.myValue)
				if (isNaN(num)) throw new Error("'"+this.myValue+"' is not a number")
				if (num < 1 || num > 10) throw new Error("'"+this.myValue+"' is not between 1 and 10")
			}
		}
	})

	// Our validator allows myValue to be undefined, so we need not give it an initial value
	var myObject = new MyClass()

	document.addEventListener('DOMContentLoaded',function() {
		var errors = document.getElementById('errors')
		var input = document.getElementById('in')
		input.addEventListener('keyup',function() {
			try {
				myObject.myValue = input.value
				errors.innerHTML = 'Your input is OK!'
				errors.style.color = 'green'
			} catch(e) {
				errors.innerHTML = e.message
				errors.style.color = 'red'
				// This will still have the previous, valid value.
				// myValue can never have a value for which your validator function throws an exception
				console.log('myValue is '+myObject.myValue)
			}
		})
	})
</script>
</head>
<body>
	Please enter a value between 1 an 10: <input id='in'/>
	<div id='errors'></div>
</body>
</html>
```

#### On the Server
```javascript
var DataTrue = require('../DataTrue').default
// JavaScript/ES5 users: Sorry about the 'default' nonsense. It's the ES6/ES2015/Babel way to doing things

// DataTrue is similar to a schema for your data.
// All classes you plan to associate with each other should be created from the same instance of DataTrue 
var schema = new DataTrue()

// Define your DataTrue classes similar to how you might use JavaScript's Object.create()
var MyClass = schema.createClass({
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
	console.log('"'+myObject.myValue+'" is between 1 and 10!')
} catch(e) {
	console.log(e.message)
}
```

### Atomic Data Manipulation
```javascript
var DataTrue = require('../DataTrue').default
var schema = new DataTrue()

var MyClass = schema.createClass({
	valA: {
		default: 5,
		validate: 'isValid',
	}
	valB: {
		default: 5,
		validate: 'isValid',
	}
	isValid: { value: function() {
		if (this.valA + this.valB > 10) throw new Error('The sum of valA and valB must be less than 10')
	}}
})


var obj = new MyClass()

try {
	obj.valA = 6
} catch(e) {
	// valA=6 + valB=5 won't validate...
}

// ...but using 'set' delays validation until your function has run
// so you can set things in any order you like
obj.DataTrue.set(obj,function(
	this.valA = 6
	this.valB = 4
))

```

### Multiple Exceptions
{{{../examples/multi-ex.js}}}

### Minimizing calls to validator functions
```javascript
var DataTrue = require('../DataTrue').default
var schema = new DataTrue()
```

### Instantiating multiple constrained objects
```javascript
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
```

#### The 'instanceof' SNAFU

### get/set Hooks
```javascript
var DataTrue = require('../DataTrue').default
var schema = new DataTrue()
```

### Constructor and Prototype
```javascript
var DataTrue = require('../DataTrue').default
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
```

## Limitations, Gotchas and Stuff You Might Have To Do Differently

## Roadmap

### Arrays
### Serialization
### Persistence / DataTrue Server
### Query Language, Sparse Objects and memory-aware data structures (The Pipe Dream)

## Current Status (Alpha/Experimental)

## Contributing
