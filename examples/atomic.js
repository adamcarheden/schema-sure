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
for (var prop in obj) {
	console.log(prop + " = " + obj[prop]) // valA = 5, valB = 5
}
// ...but using atomicSet delays validation until your function has run
// so you can set things in any order you like
obj.atomicSet(function() {
	obj.valA = 6
	obj.valB = 4
})
// NOTE: For convenience, Myclass.atomicSet(...) and schema.atomicSet(...) work the same
for (var prop in obj) {
	console.log(prop + " = " + obj[prop]) // valA = 6, valB = 4
}
