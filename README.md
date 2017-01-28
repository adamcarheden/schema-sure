# DataTrue

DataTrue is a framework for ensuring a set of related JavaScript objects are always in a valid state where "valid" is defined by a set of functions you provide. Think of it sort of like constrains in SQL, but for JavaScript objects.

DataTrue is ready for cautious production use, but has not had extensive real-world testing. See _Current Status_ below for details.

## Live Demo

(Coming Soon)

## Usage

### Basic

#### In the Browser
_*basic.html*_
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
_*basic.js*_
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

...which produces the following:

``` bash
$ node basic.js
'undefined' is not a number

$ node basic.js 20
'20' is not between 1 and 1

$ node basic.js 5
'5' /is/ between 0 and 10
```

### Atomic Data Manipulation
You can delay validation using atomicSet() for complex state transitions:

_*atomic.js*_
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
You can and should use the exceptions thrown by your validators to inform the user about why input is invalid.

_*multi-ex.js*_
```javascript
var DataTrue = require('./DataTrue').default
var schema = new DataTrue()
var sumRunCnt
var maxSum = function() { 
	sumRunCnt++
	if (this.a + this.b > 10) throw new Error('sum must be less than or equal to 10')
}
var minB = function() {
	if (this.b < 5) throw new Error('b must be greater than or equal to 5')
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
	// b must be greater than or equal to 5

	// e.exceptions is a Javascript Map object:
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
	// The exception thrown by maxSum() is reference as both a.max and b.ourMax in the exceptions object
	// since both the a and b properties subscribed to the same maxSum() validation function
	console.log(errs.a.max === errs.b.ourMax) // true
}
```

Why not just stop at the first validator that fails? Because you should give the user a complete list of what's wrong so he can fix it all at once instead of trying again only to find there's some other problem you didn't tell him about. See [HTML Form Tools](https://github.com/adamcarheden/html-form-tools) for some UI components to help with that.

### Atomic instantiation of multiple constrained objects

Sometimes you'll want circular dependencies in your validation -- One object is valid only if it has a reference to another object but the second object is only valid if it has a reference to the first. Since neither object can exist alone and validation runs when you instantiate objects, how do you instantiate two such objects? DataTrue supports this by creating vanilla Javascript objects with such a circular dependency and passing either of those objects as the init values (first argument) of the appropriate constructor: 

_*multi-construct.js*_
```javascript
var DataTrue = require('./DataTrue').default
var Validator = require('./DataTrue').Validator
var schema = new DataTrue()


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
	// The reserved property name 'DataTrue' tells us to pass binit to the constructor of another DataTrue class
	// It can be either the constructor (as returned by dataTrue.createClass()) or 
	// the class name (first argument to dataTrue.createClass())
	DataTrue: ClassB,
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
```

### Constructors and Prototypes/Subclassing

Since DataTrue defines a constructor for classes you create with it, you may be wondering if that means you can't define one. Not so! The 3rd argument to DataTrue.createClass() is you constructor. The forth argument is it's prototype, which works just likes passing prototypes to JavaScript's Object.create().

_*const-proto.js*_
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

* configurable - The same as Object.create().
* default - A default value for the property. 
* get - A function to call on the stored value before returning it. *NOT* the same as Object.create(). Your function will get the value as its argument. It will *NOT* be applied to the object (i.e. 'this' will not point to the object.)
* enumerable - The same as Object.create().
* set - A function to call on the assigned value before storing it. *NOT* the same as Object.create(). Your function will get the value as its argument. It will *NOT* be applied to the object (i.e. 'this' will not point to the object.)
* validate - Zero or more functions to call any time the property changes. It may be one of the following:
	* A string matching the name of a method of the current class
	* A function
	* A DataTrue.Validator object. This allows you to have the validator function applied to some other object when this object changes.
	* An array containing any mix of the above
	* An object where values are any of the first three above. When validation fails, the keys will be the names of the validators in the exceptions object.
* value - The same as Object.create(). Should generally only be used to define methods of your class.
* writable - The same as Object.create().

### Validation functions and DataTrue.Validator
Sometimes you want to run validation on one object when a property of some other object changes. DataTrue supports this by using Validator objects:
``` js
new DataTrue.Validator(validationFunction, applyToFunction)
```
ApplyToFunction will be applied to the current object and should return the object the validator should be applied to.

## Limitations, Gotchas and Stuff You Might Have To Do Differently
* We don't support arrays (yet). [You can't subclass a Javascript array](http://www.2ality.com/2013/03/subclassing-builtins-es6.html), so even bable has no hook to intercept array operations (push, pop, splice, etc.), so we have no way to call a validator when the array changes. However, I plan to write an 'array-like' object that runs validators befor proxying operations to an array at some point.
* I haven't done any load/big-data testing and I fully expect it won't scale well. If your data structure will have more than a few dozen related objects with cross-validation, things might get slow (or perhapse not, I haven't tested). But I suspect a large number of projects don't need any such complexity, so I expect DataTrue to be useful even if it never scales well.

## Roadmap
I plan to implement the following features:
* Arrays with validation hooks
* Serialization/Deserialization, complete with [circular reference support](https://www.npmjs.com/package/circularjs)
* Persistence / DataTrue Server - A single method call will persist all changed objects in a schema via an REST API.
* Query Language, Sparse Objects and memory-aware data structures (The Pipe Dream) - To maintain validity, all objects that reference each other must always be included when saving or loading from persistent storage. That won't scale well. A query language letting the user load some subset of objects initially and load the others later only if they're accessed could address that for some algorithms. Loading large data as arrays where the user specifies if things are orgainzed in [row- or column-major](https://en.wikipedia.org/wiki/Row-_and_column-major_order) order in memory, depending on how the algorithm will access them, could also make things fast. This sort of think might have to wait until I rewrite the whole thing in C, which is probably never. But perhapse DataTrue will serve as a useful prototype for some future technology to replace SQL and take the work out of shuffling data between memory and persistent storage and between the memory of multiple processes running on different computers.

## Current Status (Alpha/Experimental)

Everything seems to work and I have extensive unit testing. I haven't done cross-browser testing or used it on any non-trivial real-world projects yet though, so use it at your own risk.

## Contributing
``` bash
git clone https://github.com/adamcarheden/data-true.git
cd data-true
npm run build
npm run test
```
Everything important is in src/DataTrue.js


PRs welcome.
