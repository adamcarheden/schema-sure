// The SchemaSure object represents the scheam to which all objects
// All SchemaSure objects used in a program should be part of the same SchemaSure schema
// It's sort of a singleton, but we may implement a way to allow multiple schemas
// in the future, so so reason to implement singleton code
const SCHEMA_SURE_PREFIX = 'SchemaSure'
const ATOMIC_SET_KEY = 'atomicSet'
const defaultOpts = {
	ssPrefix: SCHEMA_SURE_PREFIX,
	atomicSet: ATOMIC_SET_KEY,
	writableValidatorMethods: false,
	configurableValidatorMethods: false,
}
const SchemaSure = function(opts = {}) {
	if (typeof opts !== 'object') throw new Error(`First argument, opts, to SchemaSure should be an object. You gave me a '${typeof opts}'`)
	this.opts = {}
	Object.keys(defaultOpts).forEach((k) => {
		this.opts[k] = defaultOpts[k]
	})
	Object.keys(opts).forEach((k) => {
		if (!(k in this.opts)) throw new Error(`Unknown SchemaSure option: '${k}'`)
		this.opts[k] = opts[k]
	})
	Object.freeze(this.opts) // Hard to predict what would happen if opts is modified, but it's almost certainly bad.
	this.classes = {
		byConstructor: new Map(),
		byClass: new Map(),
		byName: new Map(),
	}
	this.validating = false
	this.validators = new Map()
	Object.seal(this)
}
// This key/value is added to the ssProp key of each SchemaSure object and serves
// to distinguish instantiated SchemaSure objects from objects that have a ssProp because
// they've been deserialized but haven't yet been passed to the constructor of the
// appropriate class. Maybe a bit overkill, but it ensures isSchemaSureObject()
// can work as expected
const SS_OBJECT_FLAG = 'This is a SchemaSure Object'

const createClass = function(clName, userTemplate = {}, userConstructor = false, prototype = Object.prototype) {

	if (typeof clName !== 'string') throw new Error('The class name must be a string')

	if (typeof userTemplate !== 'object') throw new Error(`Object properties must be an object. You gave me a '${typeof userTemplate}'`)
	Object.keys(userTemplate).forEach((name) => {
		if (name.startsWith(this.ssPrefix)) throw new Error(`Property '${name}' is not allowed. SchemaSure reserves all properties starting with the string '${this.ssPrefix}'`)
	})
	if (userConstructor !== false && typeof userConstructor !== 'function') throw new Error(`Constructor must be a function. You gave me a '${typeof userConstructor}'`)

	let template = userTemplate

	const ssClass = new SchemaSureClass(clName, template, this, prototype)
	const schema = this
	const ssConstructor = function() {
		ssClass.init(this)

		let validate = false
		if (!(schema.validating instanceof Map)) {
			schema.validating = new Map() 
			validate = true // If we start validation we also finish it
		}
		var initData = arguments[0]
		if (initData) {

			let universe
			// This indicates the constructor was called by the constructor of related
			// SchemaSure object. We skip validation, as that constructor will do so once
			// all realted objects have been set up
			if (ssClass.ssProp in initData && initData[ssClass.ssProp] instanceof Map) {
				universe = initData[ssClass.ssProp]
				delete initData[ssClass.ssProp]
			} else {
				universe = new Map()
			}
			// TODO: remove this sanity check. But the user may try to do this so we have to figure out how to detect and deal with that...
			if (universe.has(initData)) throw new Error(`Something is trying to instantiate a class with the same initial values object multiple times`)
			universe.set(initData, this)

			Object.keys(initData).forEach((p) => {
				if (!(p in ssClass.template)) {
					// Unmanaged properties just get dumped into the current object
					this[p] = initData[p]
					return
				}
				if (typeof initData[p] === 'object') {
					// This resolves circular references in initData
					if (universe.has(initData[p])) { // p should point to an already-instantiated object
						initData[p] = universe.get(initData[p])
					} else if (ssClass.ssProp in initData[p]) { // p should be a SchemaSure object, but it hasn't yet been instantiated
						switch (typeof initData[p][ssClass.ssProp]) {
						case 'string':
							let DepClass = schema.lookupClass(initData[p][ssClass.ssProp])
							if (!DepClass) throw new Error(`Unknown SchemaSure class: '${initData[p][ssClass.ssProp]}' for property: '${p}'`)
							initData[p][ssClass.ssProp] = universe
							initData[p] = new DepClass(initData[p]) // Instantiate but delay validation
							break
						case 'function':
							if (!schema.isSchemaSureClass(initData[p][ssClass.ssProp])) throw new Error(`You appear to be mixing schemas. That's not allowed`) // Can we === schema objects?
							DepClass = initData[p][ssClass.ssProp]
							initData[p][ssClass.ssProp] = universe
							initData[p] = new DepClass(initData[p]) // Instantiate but delay validation
							break
						case 'object':
							// Looks like we're just initializing using a SchemaSure object
							break
						default:
							throw new Error(`Attempt to initialize a SchemaSure object with a sub-object that has a '${ssClass.ssProp}' property of unknown type '${typeof initData[p][ssClass.ssProp]}'`)
						}
					}
				}
				set[p] = { val: initData[p], block: false }
			})
		}

		Object.keys(set).forEach((k) => { 
			if (set[k].block) return
			this[k] = set[k].val
		})
		if (validate) ssClass.atomicSet(() => { }, true)

		if (userConstructor) userConstructor.apply(this, arguments)
	} // END constructor

	const objProps = {}
	objProps[this.ssTmplProp] = { get: function() { return template }}
	Object.keys(template).forEach((name) => { 
		objProps[name] = genProp(name, template[name], ssClass) 
	})
	if (!(this.atomicSetProp in objProps)) {
		objProps[schema.atomicSetProp] = { value: function(setter) {
			return schema.atomicSet(setter)
		}}
	} else {
		if (schema.atomicSetProp === ATOMIC_SET_KEY) {
			console.warn(`You've defined '${ATOMIC_SET_KEY}' on your SchemaSureClass, which SchemaSure uses. This means you can't call the '${ATOMIC_SET_KEY}' method on objects of this SchemaSure class. Alternativly, you can call 'atomicSet' on the SchemaSure schema object or any SchemaSure class, or choose a different name for the atomicSet method of your classes by defining 'atomicSet' option when instantiating SchemaSure.`)
		} else {
			console.warn(`You've defined '${schema.atomicSetProp}' on your SchemaSure class. You also set '${schema.atomicSetProp}' as the customized name for the atomicSet method in your schema. This means you can't call the '${ATOMIC_SET_KEY}' method of objects of this SchemaSure class, since your property overrides the one you told SchemaSure to use. Change the value of 'atomicSet' in the options you pass when instantiating the SchemaSure schema object or just call 'atomicSet' on the SchemaSure schema object itself or any SchemaSure class insted of calling '${schema.atomicSetProp}' on objects of this SchemaSure class.`)
		}
	}
	ssConstructor.prototype = Object.create(prototype, objProps)

	let set = {}
	let proto = prototype
	let chain = [ssConstructor.prototype]
	while (proto) {
		chain.unshift(proto) 
		proto = Object.getPrototypeOf(proto)
	}
	while (chain.length > 0) {
		proto = chain.shift()
		if (schema.ssTmplProp in proto) {
			Object.keys(proto[schema.ssTmplProp]).forEach(function(prop) {
				if ('default' in proto[schema.ssTmplProp][prop]) {
					set[prop] = { val: proto[schema.ssTmplProp][prop].default, block: false }
				} else if ('validate' in proto[schema.ssTmplProp][prop]) {
					// This ensures all validators get called, since some may check for undefined values
					// TODO: this will throw for non-writable properties with validator. That seems like a possibly illogical use case though
					set[prop] = { val: undefined, block: false }
				}
			})
		} else {
			Object.keys(set).forEach(function(prop) {
				if (proto.hasOwnProperty(prop)) set[prop] = { val: undefined, block: true }
			})
		}
	}

	Object.preventExtensions(ssConstructor)

	if (this.lookupClass(clName)) throw new Error(`A class named '${clName}' has already been defined`)
	let clObj = {
		ssConstructor: ssConstructor,
		ssClass: ssClass,
		name: clName,
	}
	this.classes.byName.set(clName, clObj)
	this.classes.byClass.set(ssClass, clObj)
	this.classes.byConstructor.set(ssConstructor, clObj)
	
	return ssConstructor
}
SchemaSure.prototype = Object.create(Object.prototype, {
	// TODO: add destruct method to remove a SchemaSure object from validators array and any other lists of objects we keep to avoid memory leaks.
	// WeakMap/Set won't work because you can't iterate over them in EC
	// API entry point
	// usage: module.exports = SchemaSure.createClass(...)
	createClass: { 
		value: createClass,
		writable: false,
		configurable: false,
	},
	isSchemaSureObject: { value: function(obj) {
		return (typeof obj === 'object' &&
			this.ssProp in obj &&
			'SS_OBJECT_FLAG' in obj[this.ssProp] &&
			obj[this.ssProp].SS_OBJECT_FLAG === SS_OBJECT_FLAG)
	}},
	isSchemaSureClass: { value: function(cl) { return this.lookupClass(cl) !== false }},
	getSchemaSureClass: { value: function(obj) {
		if (!this.isSchemaSureObject(obj)) throw new Error(`Attempt to get SchemaSure class on a value that's not a SchemaSure object`)
		return obj[this.ssProp].ssClass
	}},
	ssPrefix: { get: function() { return this.opts.ssPrefix } },
	ssProp: { get: function() { return this.ssPrefix } },
	ssTmplProp: { get: function() { return this.ssPrefix + 'Template' } },
	atomicSetProp: { get: function() { return this.opts.atomicSet } },
	atomicSet: { value: function(setter, inConstructor) {

		// TODO: remove this sanity check
		if (!inConstructor === true && this.validating !== false) throw new Error(`Internal Error: atomicSet called recursivly. That should be impossible`)
	
		// Run the user's setter function
		if (!(this.validating instanceof Map)) this.validating = new Map()
		try {
			setter([])
		} catch(e) {
			this.validating = false
			throw e
		}

		// Call all validators
		let valid = true
		let resultCache = new Map()
		this.validating.forEach((errs, keyObj) => {
			// NOTE: It's VERY important that the function call is first in the '&&' or short-circuit eval will prevent it from being called if some other validator hs failed
			valid = this.getSchemaSureClass(keyObj).validate(keyObj, resultCache) && valid
		})

		// Accept or reject modified values
		this.validating.forEach((e, o) => {
			let cl = this.getSchemaSureClass(o)
			if (valid) {
				cl.acceptNewValues(o)
			} else {
				cl.rejectNewValues(o)
			}
		})

		// Turn off validation mode
		let validating = this.validating
		this.validating = false

		if (!valid) throw new AtomicSetError(validating)

	}}, // End atomicSet

	lookupClass: { value: function(key) { 
		switch(typeof key) {
		case 'string':
			let cl = this.classes.byName.get(key)
			if (cl) return cl.ssConstructor
			break
		case 'function':
			cl = this.classes.byConstructor.get(key)
			if (cl) return cl.ssConstructor // This is redundant, but...
			break
		case 'object':
			cl = this.classes.byClass.get(key)
			if (cl) return cl.ssConstructor
			break
		default:
			throw new Error(`Attempt to lookup class with key of unsupported type '${typeof key}': '${key}'`)
		}
		return false
	}},
})

const JS_DEFINE_PROP_KEYS = ['enumerable','writable','configurable']
const genProp = function(name, tmpl, sscl) {

	if ('value' in tmpl) {
		if ('validate' in tmpl) throw new Error(`You defined both 'value' and 'validate' for the '${name}' property. SchemaSure cannot validate properties for which you directly define a value. To set a default value, use 'default' instead. You should should generally only use 'value' to define methods of your SchemaSure class.`)
		return tmpl
	}
	const getMunge = ('get' in tmpl)
		? tmpl.get
		: function(value) { return value }
	const setMunge = ('set' in tmpl)
		? tmpl.set
		: function(value) { return value }

	// This allows the user to set calculated read-only properties as per normal when validation isn't required
	const get = ('get' in tmpl && (!('validate' in tmpl) || (tmpl.validate.length === 0)))
		? tmpl.get
		: function() {
			return getMunge(
				sscl.ss.validating !== false && name in sscl.newValues(this)
					? sscl.newValues(this)[name].value
					: sscl.data(this)[name]
			)
		}

	const prop = {
		configurable: false,
		get: get,
		set: function(data) {
			data = setMunge(data)
			if (sscl.ss.validating !== false) {
				// Look up the validator for this value
				let validate = false
				if ('validate' in tmpl) {
					validate = tmpl.validate
					// Add this object to the set of objects that must be validated
					if (!sscl.ss.validating.has(this)) sscl.ss.validating.set(this, {})
				}
				// Record the changed value
				sscl.newValues(this)[name] = {
					value: data,
					validate: validate
				}
			} else {
				sscl.atomicSet(() => {
					this[name] = data
				})
			}
		},
	}
	Object.keys(tmpl).forEach((p) => {
		if (['get','set','default','validate'].indexOf(p) >= 0) return // We define get and set above. Default is only used in constructor
		if (JS_DEFINE_PROP_KEYS.indexOf(p) < 0) {
			throw new Error(`No such property configuration option '${p}' for property '${name}'`)
		}
		prop[p] = tmpl[p]
	})

	return prop
}

const Validator = function(validator, applyTo) {
	if (arguments.length < 1) throw new Error(`You must supply a validator function as the first argument`)
	if (typeof validator !== 'function') throw new Error(`validator (1st argument) must be a function, you gave me a '${typeof validator}'`)
	this.validator = validator
	if (['function','object','boolean','undefined'].indexOf(typeof applyTo) <= -1) {
		throw new Error(`applyTo (2nd argument) must be a function, you gave me a '${typeof applyTo}'`)
	}
	this.applyTo = applyTo
	Object.freeze(this)
}
Validator.prototype = Object.create(Object.prototype, {
	run: { value: function(obj, resultCache, errMap, errs) {
		let applyTo
		switch(typeof this.applyTo) {
		case 'function':
			applyTo = this.applyTo.apply(obj, [])
			break
		case 'object':
			applyTo = this.applyTo
			break
		case 'boolean':
		case 'undefined':
			applyTo = obj
			break
		default:
			throw new Error(`BUG: applyTo has invalid type: '${typeof this.applyTo}'. This should be impossible since we check in the constructor as well.`)
		}

		let runResult = {
			appliedTo: applyTo,
			returnValue: undefined,
			exception: false,
			cached: false,
		}

		if (resultCache.has(applyTo)) {
			if (resultCache.get(applyTo).has(this.validator)) {
				runResult.cached = true
				let result = resultCache.get(applyTo).get(this.validator)
				if (result instanceof Error) {
					return false
				} else {
					return true
				}
			}
		} else {
			resultCache.set(applyTo, new Map())
		}

		try {
			runResult.returnValue = resultCache.get(applyTo).set(this.validator, this.validator.apply(applyTo, []))
		} catch(e) {
			resultCache.get(applyTo).set(this.validator, e)
			runResult.exception = e
			errMap.get(this.validator).setResults(runResult, obj, errs)
			return false
		}
		return true
	}}
})

// SchemaSureClass holds references to the template and the SchemaSure schema object
class SchemaSureClass {
	constructor(clName, template, schemaSure, proto) {
		this.name = clName
		this.ss = schemaSure
		this.proto = proto

		// Fixup the validate array. This allows the user to specify something simple for simple use cases
		Object.keys(template).forEach((prop) => {
			switch (typeof template[prop]) {
			case 'object':
				break
			case 'function':
				template[prop] = { value: template[prop] }
				break
			default:
				throw new Error(`I'm not sure what to do with property '${prop}' of type '${typeof template[prop]}'. SchemaSure templates should be objects who's members are all either property definition objects or functions`)
			}
			if ('validate' in template[prop]) {
				if ('value' in template[prop]) throw new Error(`You defined both 'value' and 'validate' for the '${prop}' property. SchemaSure cannot validate properties for which you directly define a value. To set a default value, use 'default' instead of 'value'. You should should generally only use 'value' to define methods of SchemaSure classes.`)
			} else {
				if ('value' in template[prop]) return
				template[prop].validate = []
				return
			}
	
			if (Array.isArray(template[prop].validate)) {
				let vo = {}
				template[prop].validate.forEach(function(v,i) {
					vo[i] = v
				})
				template[prop].validate = vo
			} else if (typeof template[prop].validate !== 'object' || template[prop].validate instanceof Validator) {
				template[prop].validate = {'': template[prop].validate }
			}
			Object.keys(template[prop].validate).forEach((vname) => {
				var v = template[prop].validate[vname]
				switch (typeof v) {
				case 'string':
					if (!(v in template)) throw new Error(`You requested that we call '${v}' on property '${prop}', but there is no such method defined.`)
					if (!('value' in template[v])) {
						throw new Error(`You requested that we call '${v}' on property '${prop}', but '${v}' is a property managed by SchemaSure. We were expecting a function. Perhapse you wanted to make '${prop}' a method of your class by setting the 'value' key for that property to a function in your object template.`)
					} else {
						if (typeof template[v].value !== 'function') throw new Error(`You requested that we call '${v}' to validate property '${prop}', but '${v}' is a '${typeof template[v].value}', not a function`)
					}
					if ('writable' in template[v]) {
						if (!schemaSure.opts.writableValidatorMethods && template[v].writable) throw new Error(`You're using method ${v} as a validator for property ${prop}, but you're also trying to make the property ${v} writable. ${prop} MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the 'writableValidatorMethods' option to true when instantiating your SchemaSure schema object.`)
					} else {
						template[v].writable = false
					}
					if ('configurable' in template[v]) {
						if (!schemaSure.opts.configurableValidatorMethods && template[v].configurable) throw new Error(`You're using method ${v} as a validator for property ${prop}, but you're also trying to make the property ${v} configurable. ${prop} MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the 'configurableValidatorMethods' option to true when instantiating your SchemaSure schema object.`)
					} else {
						template[v].configurable = false
					}
					template[prop].validate[vname] = new Validator(template[v].value)
					break
				case 'function':
					template[prop].validate[vname] = new Validator(v)
					break
				case 'object':
					if (!(v instanceof Validator)) throw new Error(`You passed an object that wasn't a SchemaSure.Validator as the validator named '${vname}' for property '${prop}'`)
					break
				default:
					throw new Error(`You passed something of type '${typeof v}' as the validator named '${vname}' for property '${prop}'. That doesn't make sense. Please see the SchemaSure documentation.`)
				}

				// This just ensures a key for this validator function exists
				// Doing this check once per class means we call Map.has() less often than if we checked each time an object is created,
				// though the microsecods that saves are probably insignificant
				if (!this.ss.validators.has(template[prop].validate[vname].validator)) {
					this.ss.validators.set(template[prop].validate[vname].validator, new ValidatorObjectMap())
				}

			}) // END vname/each validator
		})
		this.template = template
		Object.freeze(this.template) // TODO: freeze is shallow. We really want a deep freeze, but...
	}

	// Walks the prototype chain to build and return a template that includes properties defined by superclasses
	getFullTemplate(obj) {
		let proto = obj
		let tmpl = {}
		while (proto) {
			if (proto.hasOwnProperty(this.ss.ssTmplProp)) {
				Object.getOwnPropertyNames(proto[this.ss.ssTmplProp]).forEach((prop) => {
					if (prop in tmpl) return // This happens if a subclass redefines a superclass prop
					tmpl[prop] = proto[this.ss.ssTmplProp][prop]
				})
			}
			proto = Object.getPrototypeOf(proto)
		}
		return tmpl
	}

	// That property must have the same name on all SchemaSure objects within a schema
	get ssProp() { return this.ss.ssProp }
	set ssProp(v) { throw new Error(`You may not change the SchemaSure property after you instantiated a SchemaSure schema. `) }

	data(obj) { return obj[this.ssProp]._ }

	newValues(obj) { 
		// TOOD: remove this sanity check
		if (this.ss.validating === false) throw new Error(`Internal Error: newValues called when we're not validating.`) // TODO: remove sanity check
		if (!('__' in obj[this.ssProp])) obj[this.ssProp].__ = {}
		return obj[this.ssProp].__ 
	}

	validate(obj, resultCache) {
		let valid = true
		let newValues = this.newValues(obj)
		Object.keys(newValues).forEach((value) => {
			if (!newValues[value].validate) return
			Object.keys(newValues[value].validate).forEach((vname) => {
				valid = newValues[value].validate[vname].run(obj, resultCache, this.ss.validators, this.ss.validating) && valid
			})
		})
		return valid
	}

	acceptNewValues(obj) { 
		// TOOD: remove this sanity check
		if (this.ss.validating === false) throw new Error(`Internal Error: acceptNewValues called when we're not validating.`)
		Object.keys(this.newValues(obj)).forEach((value) => {
			this.data(obj)[value] = this.newValues(obj)[value].value
		})
		delete obj[this.ssProp].__
	}	

	rejectNewValues(obj) { 
		// TOOD: remove this sanity check
		if (this.ss.validating === false) throw new Error(`Internal Error: rejectNewValues called when we're not validating.`)
		delete obj[this.ssProp].__
	}

	// Links this object to all of it's validation functions
	// This lets us make any validation function that would have flagged a property in this object as an error do so
	// even if that property didn't change but became invalid because some other property changed.
	// Yes, this is ugly. But keeping such uglyness out of your code is why you're using this library.
	mapValidators(obj) {
		let tmpl = this.getFullTemplate(obj)
		Object.keys(tmpl).forEach((prop) => {
			if (!('validate' in tmpl[prop])) return
			Object.keys(tmpl[prop].validate).forEach((vname) => {
				let applyTo = tmpl[prop].validate[vname].applyTo
				if (typeof applyTo === 'boolean' || typeof applyTo === 'undefined') applyTo = obj
				this.ss.validators.get(tmpl[prop].validate[vname].validator).add(applyTo, prop, vname)
			})
		})
	}

	init(obj) {
		Object.defineProperty(obj, this.ssProp, {
			value: {
				ss: this.ss,
				ssClass: this,
				_: {},
				SS_OBJECT_FLAG: SS_OBJECT_FLAG,
			},
		})
		this.mapValidators(obj)
	}

	atomicSet(setter, inConstructor) {
		return this.ss.atomicSet(setter, inConstructor) 
	}
}
class ValidatorObjectMap {
	constructor() {
		this.objects = new Map()
		this.functions = new Map()
	}
	add(item, prop, vname) {
		let spec = { property: prop, validator: vname }
		let itemType = `${typeof item}s`
		switch (itemType) {
		case 'functions':
		case 'objects':
			break
		default:
			throw new Error(`BUG: ValidatorObjectMap.add() got something other than a function or an object. That should be impossible.`)
		}
		let specList = []
		if (this[itemType].has(item)) {
			specList = this[itemType].get(item)
		} else {
			this[itemType].set(item, specList)
		}
		specList.push(spec)
	}
	
	setResults(result, obj, errObj) {

		if (result.exception === false) throw new Error(`setResults called when no exception was thrown`) // TODO: remove this sanity check

		let getErrs = function(o) {
			let errs = {}
			if (errObj.has(o)) {
				errs = errObj.get(o)
			} else {
				errObj.set(o, errs)
			}
			return errs
		}

		let doSet = function(errs, specList) {
			specList.forEach(function(spec) {
				if (!(spec.property in errs)) errs[spec.property] = {}
				if (spec.validator in errs[spec.property]) throw new Error(`Internal Error: validator '${spec.validator}' already defined for property '${spec.property}' on this object. That should be impossible.`) // TOOD: remote this sanity check
				errs[spec.property][spec.validator] = result.exception
			})
		}

		// Set it on the current object
		if (result.appliedTo === obj) {
			if (this.objects.has(obj)) {
				doSet(getErrs(obj), this.objects.get(result.appliedTo))
			} else {
				throw new Error(`BUG: SchemaSure validator called on an object that had no registered validators`)
			}
		}
		this.functions.forEach((specList, applyTo) => {
			let appliedTo = applyTo.apply(obj,[])
			if (appliedTo !== result.appliedTo) return
			doSet(getErrs(appliedTo), specList)
		})
	}
}
class AtomicSetError extends Error {
	constructor(exceptions) {
		var msgs = new Map()
		exceptions.forEach(function(errs, keyObj) {
			Object.keys(errs).forEach(function(value) {
				Object.keys(errs[value]).forEach(function(vname) {
					if (msgs.has(errs[value][vname])) return
					msgs.set(errs[value][vname],errs[value][vname].message)
				})
			})
		})
		super(Array.from(msgs.values()).join(`\n`))
		// instanceof doesn't work for subclasses in babel, apparently 
		// even with babel-plugin-transform-builtin-extend, which isn't even supposed to work for ie<=10 anyway
		// This provides a way to test for this Error subclass until es6 is born for real
		this.AtomicSetError = true
		this.exceptions = exceptions

		// Wait, shouldn't this be declared as a class method?
		// Of course, but babel and es6 classes and inheretance is totally screwed up, so that doesn't work
		Object.defineProperty(this, 'getExceptionsFor', { value: function(object, property, validator) {
			if (!this.exceptions.has(object)) return false
			let oe = this.exceptions.get(object)
			if (!property) return oe
			if (!(property in oe)) return false
			let pe = oe[property]
			if (validator === true) return pe
			if (validator === false) return Object.keys(pe).map((vname) => { return pe[vname] })
			if (!(validator in pe)) return false
			return pe[validator]
		}})
		Object.freeze(this)
	}

}

export { 
	SchemaSure as default, 
	AtomicSetError,
	Validator
}
