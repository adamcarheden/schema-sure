(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("DataTrue", [], factory);
	else if(typeof exports === 'object')
		exports["DataTrue"] = factory();
	else
		root["DataTrue"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

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

			// Make a fake object with the new values
			var FakeObj = function() {}
			var fakeObjProps = {}
			Object.keys(data).forEach((k) => {
				if (!(k in this.template)) throw Error(`Attempt to set property '${k}'. No such property in template.`)
				if ('template' in this.template[k]) { throw new Error('To be implemented') }
				fakeObjProps[k] = { get: function() { 
					return data[k] 
				}}
			})
			FakeObj.prototype = Object.create(this, fakeObjProps)
			var fakeObj = new FakeObj()

			// Run validation on the fake object
			var subs = {}
			// This ensures we run each validation function only once
			Object.keys(data).forEach((k) => {
				if ('template' in this.template[k]) throw new Error('Not yet implemented')
				this.template[k].subscribe.forEach((sub) => {
					if (!(sub in subs)) subs[sub] = []
					subs[sub].push(k)
				})
			})
			var errors = {}
			var errcnt = 0
			// We pass the list of properties subscribed to each validator
			// This allows our built-in validators to be reusable but still
			// act on a specific property
			Object.keys(subs).forEach((sub) => {
				try {
					this.validators[sub].apply(fakeObj, [subs[sub], data])
				} catch (e) {
					if (e instanceof Error) {
						subs[sub].forEach(function(prop) {
							if (!(prop in errors)) errors[prop] = []
							errors[prop].push(e)
							errcnt++
						})
					} else {
						// If the validator returned multiple errors, associate each with the right properties
						Object.keys(e).forEach((prop) => {
							// Make sure the object thrown by the validation function meets the expected structure 
							if (subs[sub].indexOf(prop) < 0) throw new Error(`Property validator '${sub}' threw something that wasn't an error and contained key '${prop}', which isn't one of the properties that subscribes to it. Subscripions were: ${subs[sub].join(',')}`)
							if (!Array.isArray(e[prop])) e[prop] = [e[prop]]
							e[prop].forEach(function(e2) {
								if (!(e2 instanceof Error)) throw new Error(`Property validator '${sub}' included a '${typeof e2}'${(typeof e2 === 'object') ? ' of type '+(e2.constructor.name) : ''} as one of the errors for property ${prop}. All members of the returned array should be Error objects`)
							})
							if (!(prop in errors)) errors[prop] = []
							errors[prop] = errors[prop].concat(e[prop])
							errcnt += e[prop].length
						})
					}
				}
			})
			// We throw an object who's keys match properties and who's values are 
			// arrays of the errors thrown. We need an array because properties may
			// subscribe to multiple validators and therefore may have multiple errors.
			// References to an errors may end up in multiple places in the errors array
			// if they coorespond to multiple properties.
			if (errcnt > 0) throw errors

			// Push validation to real object if it works
			Object.keys(data).forEach((k) => {
				if ('template' in this.template[k]) { throw new Error('To be implemented') }
				obj[this.opts.shadowProp][k] = data[k]
			})
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

			var missingDefaults = []
			Object.keys(dataTrue.template).forEach((k) => {
				// Initialize default values and
				// Ensure non-defaults are passed as init params
				if ('default' in dataTrue.template[k]) {
					this[dataTrue.opts.shadowProp][k] = dataTrue.template[k].default
				} else if (typeof data !== 'object' || !(k in data)) {
					missingDefaults.push(k)
				}
			})
			if (missingDefaults.length !== 0) throw new Error(`The following values must be supplied as keys to the first parameter of this class: '${missingDefaults.join("','")}'`)

			if(data) dataTrue.set(this, data)

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
		Object.keys(template).forEach(function(name) { 
			objProps[name] = propSpec(name, template[name], dataTrue) 
		})
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
		if ('template' in prop) { throw new Error('To be implemented') }
		Object.keys(prop).forEach(function(k) {
			if (propKeys.indexOf(k) < 0) throw new Error(`Unknown key '${k}' in template.'${name}'. Valid keys are ${propKeys.join(', ')}`)
		})

		// Validator
		if ('validate' in prop) {
			if (name in dataTrue.validators) {
				throw new Error(`You'e specified a validate function for template.'${name}' in addition to a validate function for that key in the validators object. Please use one or the other, not both.`)
			}
			switch (typeof prop.validate) {
			case 'function':
				dataTrue.validators[name] = prop.validate 
				break
			case 'string':
				if (!(prop.validate in dataTrue)) {
					throw Error(`You specified '${prop.validate}' as the validate function for template.'${name}', but there is no such key in the validators array`)
				}
				break
			default:
				throw new Error(`template.'${name}'.validate is a '${typeof prop.validate}', expecting a function or a string matching a key in the validate array.`)
			}
		}

		// Ensure we have a list of subscriptions
		if (!('subscribe' in prop)) prop.subscribe = []
		if (!Array.isArray(prop.subscribe)) {
			throw new Error(`subscribe should be an array`)
		}

		// Ensure we're subscribed to the validator that shares our name
		if (name in dataTrue.validators && prop.subscribe.indexOf(name) < 0) {
			dataTrue.template[name].subscribe.unshift(name)
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

	var testEachProp = function(obj, props, test) {
		if (!Array.isArray(props)) props = [props]
		var errors = {}
		props.forEach(function(name) {
			try {
				test.apply(obj, [name]) 
			} catch (e) {
				errors[name] = e 
			}
		})
		if (Object.keys(errors).length > 0) throw errors
	}
	var validators = {
		positiveInteger: function(invokingProps) {
			testEachProp(this, invokingProps, function(name) {
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
			})
		},
		nonNegativeInteger: function(invokingProps) {
			testEachProp(this, invokingProps, function(name) {
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
			})
		}
	}

	module.exports = {
		getExports: getExports,
		validators: validators,
	}


/***/ }
/******/ ])
});
;