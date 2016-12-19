var DataTrue = require('../../../DataTrue').default;
// JavaScript/ES5 users: Sorry about the 'default' nonsense. It's the ES6/ES2015/Babel way to doing things
var schema = new DataTrue();
var MyClass = schema.createClass({
	'myValue': {
		validate: function() {
			var num = parseInt(this.myValue);
			if (isNaN(num)) throw new Error("'"+this.myValue+"' is not a number");
			if (num < 1 || num > 10) throw new Error("'"+this.myValue+"' is not between 1 and 10");
		}
	}
});
var firstArg = process.argv[2];
try {
	var myObject = new MyClass({myValue: firstArg});
	console.log('"'+myObject.myValue+'" is between 1 and 10!');
} catch(e) {
	console.log(e.message);
}
