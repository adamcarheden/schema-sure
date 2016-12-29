var DataTrue = require('./DataTrue').default
var schema = new DataTrue()
var MyClass = schema.createClass({
	other: {}
})
var MyOtherClass = schema.createClass({
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
