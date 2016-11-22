var defaultOpts = {
	dtprop: '__dataTrue',
	shadowProp: '__',
	constructor: false,
	prototype: Object.prototype,
}

class DataTrue {
	constructor(validators, template, opts) {
		this.template = JSON.parse(JSON.stringify(template))
		this.validators = {}
		if (typeof validators !== 'object') {
			throw new Error(`validators shold be an object, not a ${typeof validators}`)
		}
		Object.keys(validators).forEach((k) => {
			if (typeof validators[k] !== 'function') {
				throw new Error(`validators.'${k}' should be a function, not a '${typeof validators[k]}'`)
			}
			this.validators[k] = validators[k]
		})
		this.opts = opts
	}

	set(obj, data) {
		throw new Error(`Not yet implemented`)
	}

}

var getExports = function(template, validators, options) {
	Object.keys(options).forEach(function(opt) {
		if (!(opt in defaultOpts)) throw new Error(`Unknown option: '${opt}'`)
	})
	var opts = {}
	Object.keys(defaultOpts).forEach(function(opt) {
		opts[opt] = (opt in options) ? options[opt] : defaultOpts[opt]
	})

	var dataTrue = new DataTrue(validators, template, opts)

	// A constructor for the user's class
	var exports = function(data) {

		// Where we store the real data and other metadata
		this[opts.dtprop] = dataTrue

		// Where the actual data is stored
		this[opts.shadowProp] = {}

		// Initialize default values
		Object.keys(dataTrue.template).forEach((k) => {
			if ('default' in dataTrue.template[k]) {
				this[dataTrue.opts.shadowProp][k] = dataTrue.template[k].default
			}
		})

		// Initialize the object with data and validate
		dataTrue.set(this, data)

		// Call the user's constructor
		if (opts.constructor) {
			var args = Array.prototype.slice.call(arguments)
			args.shift()
			opts.constructor.apply(this, args)
		}

		Object.preventExtensions(this)
	}

	// Enforce properties and validation
	var objProps = {}
	if (typeof template !== 'object') throw new Error(`template should be an object, not a '${typeof template}'`)
	Object.keys(template).forEach(function(name) { objProps[name] = propSpec(name, template[name], dataTrue) })
	exports.prototype = Object.create(opts.prototype, objProps)

	return exports
}

const propKeys = ['default','validate','subscribe']
var propSpec = function(name, prop, dataTrue) {

	if (typeof prop === 'function') {
		return { value: prop, configurable: true, writable: false }
	}

	// Validate input
	if (typeof prop !== 'object') throw new Error(`template.'${name}' should be an object, not a '${typeof prop}'`)
	Object.keys(prop).forEach(function(k) {
		if (propKeys.indexOf(k) < 0) throw new Error(`Unknown key '${k}' in template.'${name}'. Valid keys are ${propKeys.join(', ')}`)
	})

	// Validator
	if ('validator' in prop) {
		if (name in dataTrue.validators) throw new Error(`You'e specified a validator function for template.'${name}' in addition to a validator function for that key in the validators object. Please use one or the other, not both.`)
		switch (typeof prop.validator) {
		case 'function':
			dataTrue.validators[name] = prop.validator 
			break
		case 'string':
			if (!(prop.validator in dataTrue)) {
				throw Error(`You specified '${prop.validator}' as the validator function for template.'${name}', but there is no such key in the validators array`)
			}
			break
		default:
			throw new Error(`template.'${name}'.validator is a '${typeof prop.validator}', expecting a function or a string matching a key in the validators array.`)
		}
	}

	// Ensure we have a list of subscriptions
	if (!('subscribe' in prop)) prop.subscribe = []
	if (!Array.isArray(prop.subscribe)) {
		throw new Error(`subscribe should be an array`)
	}

	// Ensure we're subscribed to the validator that shares our name
	if (name in dataTrue.validators && prop.subscribe.indexOf(name) < 0) {
		prop.subscribe.unshift(name)
	}

	// Ensure all subscriptions are valid
	prop.subscribe.forEach(function(sub) {
		if (!(sub in dataTrue.validators)) throw new Error(`'${name}' is subscribed to '${sub}', but there is no such key in validators.`)
	})

	return {
		configurable: false,
		enumerable: true,
		get: function(name) { return this[dataTrue.shadowProp][name] },
		set: function(name, value) { dataTrue.set(this, {name: value}) },
	}
}

var validators = {
	positiveInteger: function(name) {
		var msg =`${name} should be a number greater than zero`
		switch(typeof this[name]) {
		case 'number':
			if (this[name] <= 0) throw new Error(msg)
			return true
		case 'string':
			if (!this[name].match(/^ *[1-9]\d* */)) throw new Error(msg)
			return true
		}
		throw new Error(msg)
	},
	nonNegativeInteger: function(name) {
		var msg =`${name} should be a number greater than or equal to zero`
		switch(typeof this[name]) {
		case 'number':
			if (this[name] < 0) throw new Error(msg)
			return true
		case 'string':
			if (!this[name].match(/^ *\d* */)) throw new Error(msg)
			return true
		}
		throw new Error(msg)
	}
}

module.exports = {
	getExports: getExports,
	validators: validators,
}
