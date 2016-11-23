# data-true

# Questions
* How do we handle arrays?
* Do we allow non-templated properties?
* What if the model contains circular references?
	* How do we handle looking and ensuring a single instance of an object?
	* If circularly dependent objects reference each other on validation, don't we have a chicken/egg?
* How do validator functions handle deep referenes?
* Do we allow pre/post hooks?
* Do we allow munging data?
* Do we store original value before typing/conversion/validation?
* Can we use lodash or similar to validate common data types?
* Is persistence/validation a conflicting dual-mandate?
* Is single-instance/persistence a conflicting dual-mandate (or just too big of a problem to deal with)?
* Is this compatable with inheritance and/or mixins?


API: 
1. Define a template
2. Create a sigle class module that calls DataTrue.getConstructor(myProto, template, validators).
	* getConstructor() returns the function that comprises the module.
	* getConstructor() has set the prototype of the returned function to Object.create(myProto, <generated props here>)
3. get functions are generated for all properties
4. The template contains a set of named validator functions. Properties subscribe to zero or more validator functions by name.
4. set functions are created automatically for properties that subscribe only to their own validator.
5. User's user calls `new FooBar()` as per normal, but all init values must be passed in as a single object.


Validation:
Validators are called in context of new object created with Object.create that have the real object as it's prototype and a objectProperties generated from the set of properties that subscribe to that validator.

var realValidator = function(obj1, obj2) {...}
var ClassOne = DataTrue.getExport({
		that: {
		}
	},{ v1: function() { realValidator(this, this.that); } }, opts);
var ClassTwo = DataTrue.getExport({}, {
		that: {
		},
	},{ v2: function() { realValidator(this.that, this); } }, opts);
var o1 = new ClassOne();
var o2 = new ClassTwo();
o1.that = o2;
o2.that = o1;


Validation use cases:
* Depends only on the value itself
* Depends only on itself and other basic type properties of the same object.
* Depends on itself, props of the same object and 






# API:
* DataTrue.getExport(template, validators, opts)
	* template: Object, each property is an object with the following keys:
		* default: a default value. If absent, the object passed to the constructor returned by getExpoert() must contain a value.
		* template: Presense indicates that the property is another DataTrue object. Template is the template for that object
		* subscribe: List of strings coorisponding to the keys of the validators. These functions will be called when this property is set. If a validator with the same name as the key exists, it is implicitly subscribed
		* circular references?
	* validators: Object, each property is a function that will be called when subscribed properties change. If the changed property is invalid, the function should throw an exception.
	* opts: Object, 
		* preventExtensions: true
* User calls `var bar = new <Foo>` where <Foo> is the thing returned by DataTrue.getExport() to create objects of that type.
* bar.__dataTrue.transaction({}) sets multiple values at once.
	* Validation is run on a new object with the values passed in and the real object as its prototype
	* If a new value is for a property that has a template, transation is called on that object too.
	* All validator functions are called, all exceptions are caught and filed in a structure mirroring what was passed in but with an object as the value that has keys matching the name of the validator function that threw the exception. This structure is thrown.
* Serialize using circularJSON
* To deserialize, just pass output of serialize to constructor -- Keeps array of all objects encountered and matches references where input structure has matching '===' references.





