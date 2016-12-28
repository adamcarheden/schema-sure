var DataTrue = require('../DataTrue').default
var schema = new DataTrue()

var MyClass = schema.createClass({
	valA: {
		default: 5,
		validate: 'isValid',
	},
	valB: {
		default: 5,
		validate: 'isValid',
	},
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
MyClass.set(obj,function() {
	this.valA = 6+7
	this.valB = 4
})
console.log({
	A: obj.valA,
	B: obj.valB,
})
