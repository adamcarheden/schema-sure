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
	// prints:
	// sum must be less than or equal to 10
	// b must be greater than 5
	console.log(e.message)

	// The e.exceptions is a Javascript Map object:
	// (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
	// The keys can be any object created using your DataTrue schema
	// The values are the exceptions thrown by each validator organized in objects
	// ordered first by the property name then the validator name
	var errs = e.exceptions.get(obj)
	// prints:
	// a
	//  	max: sum must be less than or equal to 10
	// b
	//  	ourMax: sum must be less than or equal to 10
	//  	myMin: b must be greater than 5
	for (var prop in errs) {
		console.log(prop)
		for (var validator in errs[prop]) {
			console.log("\t"+validator+": " + errs[prop][validator].message)
		}
	}
	// maxSum is run only once even though change to both a and b require it
	// Each validator function is run exactly once per object it's called on
	console.log(sumRunCnt) // 1
	// The exception it threw is reference in both places in the exceptions object
	console.log(errs.a.max === errs.b.ourMax) // true
}
