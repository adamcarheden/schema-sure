# data-true

DataTrue is a framework for ensuring a set of related JavaScript objects are always in a valid state where "valid" is defined by a set of functions you provide. Think of it sort of like constrains in SQL, but for JavaScript objects.

DataTrue is ready for cautious production use, but has not had extensive real-world testing. See _Current Status_ below for details.

## Usage

### Basic

#### In the Browser
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Data True Basic Browser Example</title>
<script src='../DataTrue.js'></script>
<script>
	var DataTrue = window['DataTrue'].default
	// JavaScript/ES5 users: Sorry about the 'default' nonsense. It's the ES6/ES2015/Babel way to doing things

	// DataTrue is similar to a schema for your data.
	// All classes you plan to associate with each other should be created from the same instance of DataTrue 
	var schema = new DataTrue()

	// Define your DataTrue classes similar to how you might use JavaScript's Object.create()
	var MyClass = schema.createClass('MyClass', {
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
}
```

### Atomic Data Manipulation
You can delay validation using atomicSet() for complex state transitions
```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()
var MyClass = schema.createClass('MyClass', {
	valA: {
		default: 5,
		validate: 'isValid',
		enumerable: true,
	},
	valB: {
		default: 5,
		validate: 'isValid',
		enumerable: true,
	},
	isValid: { value: function() {
		if (this.valA + this.valB > 10) throw new Error('The sum of valA and valB must be less than 10')
	}}
})
var obj = new MyClass()
try {
	obj.valA = 6 // valA=6 + valB=5 won't validate, so this throws...
	obj.valB = 4 // ...and neither valA nor valB are set
} catch(e) {}
var prop
for (prop in obj) {
	console.log(prop + ' = ' + obj[prop]) // valA = 5, valB = 5
}
// ...but using atomicSet delays validation until your function has run
// so you can set things in any order you like
obj.atomicSet(function() {
	obj.valA = 6
	obj.valB = 4
})
// NOTE: For convenience, Myclass.atomicSet(...) and schema.atomicSet(...) work the same
for (prop in obj) {
	console.log(prop + ' = ' + obj[prop]) // valA = 6, valB = 4
}
```

### Collecting exceptions from all failing validators
```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()
var sumRunCnt
var maxSum = function() { 
	sumRunCnt++
	if (this.a + this.b > 10) throw new Error('sum must be less than or equal to 10')
}
var minB = function() {
	if (this.b < 5) throw new Error('b must be greater than 5')
}
var MyClass = schema.createClass('MyClass', {
	a: {
		default: 5,
		validate: {'max': maxSum }
	},
	b: {
		default: 5,
		validate: {'ourMax': maxSum, 'myMin' : minB },
	},
})
var obj = new MyClass()
sumRunCnt = 0
try {
	obj.atomicSet(function() {
		obj.a = 9
		obj.b = 3
	})
} catch(e) {
	console.log(e.message)
	// prints:
	// sum must be less than or equal to 10
	// b must be greater than 5

	// The e.exceptions is a Javascript Map object:
	// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
	// The keys are all DataTrue objects modified by your atomicSet() function.
	// The values are the exceptions thrown by each validator organized as objects ordered 
	// first by the property name then the validator name
	var errs = e.exceptions.get(obj)
	for (var prop in errs) {
		console.log(prop)
		for (var validator in errs[prop]) {
			console.log('  '+validator+': ' + errs[prop][validator].message)
		}
	}
	// prints:
	// a
	//  	max: sum must be less than or equal to 10
	// b
	//  	ourMax: sum must be less than or equal to 10
	//  	myMin: b must be greater than 5

	// maxSum() is run only once even though both the change to a and b require it
	// Validator functions never run more than once on the same object
	console.log(sumRunCnt) // 1
	// The exception thrown by maxSum() is reference in both places in the exceptions object
	console.log(errs.a.max === errs.b.ourMax) // true
}
```
Why not just stop at the first validator that fails? Because you should give the user a complete list of what's wrong so he can fix it all at once instead of trying again only to find there's some other problem you didn't tell him about. Additional tools for that purpose will be linked here in the near future.

### Atomic instantiation of multiple constrained objects
```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()

// Validators can span objects. You may want to validate one object when the value on some other object changes.
var MIN = 0
var MAX = 4
var inRange = function() {
	var sum = this.sum() + this.relObj.sum()
	if (sum < MIN || sum > MAX) throw new Error('The sum of all values must be between '+MIN+' and '+MAX)
} 
var ClassA = schema.createClass(
	'ClassA',
	{
		valA: {
			// 'validate' and 'default' are DataTrue-specific. JavaScripts Object.create() doesn't have them

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

### Constructors and Prototypes/Subclassing
```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()

var NonDTClass = function() {}
NonDTClass.prototype = Object.create(Object.prototype, { 
	parentValue: { 
		get: function() { return 'parent' }
	}}
)

var ClassA = schema.createClass(
	// A name (Required for planned future serialization/deserialization feature)
	'ClassA',

	// Your Object Definition
	{ myValue: {} },

	// Your constructor runs after DataTrue has assigned values to the object
	// It receives an argument array with the first argument to 'new Class(...)' shifted out
	function(initVals, arg2, arg3) { 
		this.myValue += arg2 + arg3
	},

	// The prototype of your class
	NonDTClass.prototype
)

var a = new ClassA(
	{ myValue: 1 }, // Initializaion values. DataTrue assigns these for you
	2,              // arg2
	3               // arg3
	// You can pass as many additional values as you like
)
console.log(a.myValue)     // 6
console.log(a.parentValue) // parent
```

## API

### Creating classes
dataTrue.createClass(className (string), classDefinition, constructor, parentPrototype)

### Class Definitions
Class definitions are objects where each property is a specification for a property of that name on instances of your class. This is similar to Javascript's native [Object.create()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create). Each property definition can contain the following keys:

* configurable - The same a Object.create().
* default - A default value for the property. 
* get - A function to call on the stored value before returning it. *NOT* the same as Object.create(). Your function will get the value as its argument. It will *NOT* be applied to the object (i.e. 'this' will not point to the object.)
* enumerable - The same a Object.create().
* set - A function to call on the assigned value before storing it. *NOT* the same as Object.create(). Your function will get the value as its argument. It will *NOT* be applied to the object (i.e. 'this' will not point to the object.)
* validate - Zero or more functions to call any time the property changes. It may be one of the following:
** A string matching the name of method of the current class
** A function
** A DataTrue.Validator object. This allows you to have the validator function applied to some other object when this object changes.
** An array containing any mix of the above
** An object where values are any of the first three above. When validation fails, the keys will be the names of the validators in the exceptions object.
* value - The same as Object.create(). Should generally only be used to define methods of your class.
* writable - The same a Object.create().

### Validation functions and DataTrue.Validator
Sometimes you want to run validation on one object when a property of some other object changes. DataTrue supports this by using Validator objects:
``` js
new DataTrue.Validator(validationFunction, applyToFunction)
```
ApplyToFunction will be applied to the current object and should return the object the validator should be applied to.

## Limitations, Gotchas and Stuff You Might Have To Do Differently

### Always use 'this' in AtomicSet()
AtomicSet prevents modification of an object and any DataTrue objects that object holds references to by running both your setter function and validation on "fake" objects. These fake objects proxy values from the real DataTrue objects when you read them but don't actually set them on the real DataTrue objects unless all the appropriate validation functions return without throwing an exception. However, there is no way to prevent you from modifying the real objects using references to them other than 'this'.

```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()
var MyClass = schema.createClass('MyClass', {
	other: {}
})
var MyOtherClass = schema.createClass('MyClass', {
	val: { 
		default: 0,
		validate: function() { if (this.val > 10) throw new Error('"val" must be less than 10') }
	}
})
var myOther = new MyOtherClass()
var myObj = new MyClass({other: myOther})
try {
	myObj.atomicSet(function() {
		myOther.val = 11 // This is WRONG!!!
		//this.other.val = 11 // but 'this' would be right
	})
} catch (e) {
	console.log(e.message) // This will never execute because you circumvented validation by using myobj instead of 'this'
}
console.log(myOther.val) // 11
```


## Roadmap

### Arrays
### Serialization
### Persistence / DataTrue Server
### Query Language, Sparse Objects and memory-aware data structures (The Pipe Dream)

## Current Status (Alpha/Experimental)

## Contributing
