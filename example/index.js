import Example from './Example'

var obj
try {
	obj = new Example({reqPosInt: 0, optNonNegInt: -1})
} catch (e) { console.log(e) }

console.log(obj)

