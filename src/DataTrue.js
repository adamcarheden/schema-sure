// The DataTrue object represents the scheam to which all objects
// All DataTrue objects used in a program should be part of the same DataTrue schema
// It's sort of a singleton, but we may implement a way to allow multiple schemas
// in the future, so so reason to implement singleton code
const DATATRUE_PREFIX = 'DataTrue'
const ATOMIC_SET_KEY = 'atomicSet'
const defaultOpts = {
	dtPrefix: DATATRUE_PREFIX,
	atomicSet: ATOMIC_SET_KEY,
	writableValidatorMethods: false,
	configurableValidatorMethods: false,
}
const DataTrue = function(opts = {}) {
	if (typeof opts !== 'object') throw new Error(`First argument, opts, to DataTrue should be an object. You gave me a '${typeof opts}'`)
	this.opts = {}
	Object.keys(defaultOpts).forEach((k) => {
		this.opts[k] = defaultOpts[k]
	})
	Object.keys(opts).forEach((k) => {
		if (!(k in this.opts)) throw new Error(`Unknown DataTrue option: '${k}'`)
		this.opts[k] = opts[k]
	})
	Object.freeze(this.opts) // Hard to predict what would happen if opts is modified, but it's almost certainly bad.
	this.classes = {
		byConstructor: new Map(),
		byClass: new Map(),
		byName: new Map(),
	}
	this.validating = false
	Object.seal(this)
}
// This key/value is added to the dtProp key of each dataTrue object and serves
// to distinguish instantiated DataTrue objects from objects that have a dtProp because
// they've been deserialized but haven't yet been passed to the constructor of the
// appropriate class. Maybe a bit overkill, but it ensures isDataTrueObject()
// can work as expected
const DT_OBJECT_FLAG = 'This is a DataTrue Object'

const createClass = function(clName, userTemplate = {}, userConstructor = false, prototype = Object.prototype) {

	if (typeof clName !== 'string') throw new Error('The class name must be a string')

	if (typeof userTemplate !== 'object') throw new Error(`Object properties must be an object. You gave me a '${typeof userTemplate}'`)
	Object.keys(userTemplate).forEach((name) => {
		if (name.startsWith(this.dtPrefix)) throw new Error(`Property '${name}' is not allowed. DataTrue reserves all properties starting with the string '${this.dtPrefix}'`)
	})
	if (userConstructor !== false && typeof userConstructor !== 'function') throw new Error(`Constructor must be a function. You gave me a '${typeof userConstructor}'`)

	let template = userTemplate //JSON.parse(JSON.stringify(userTemplate))

	const dtClass = new DataTrueClass(clName, template, this, prototype)
	const schema = this
	const dtConstructor = function() {
		dtClass.init(this)


		let validate = false
		if (!(schema.validating instanceof Map)) {
			schema.validating = new Map() 
			validate = true // If we start validation we also finish it
		}
		var initData = arguments[0]
		if (initData) {

			let universe
			// This indicates the constructor was called by the constructor of related
			// DataTrue object. We skip validation, as that constructor will do so once
			// all realted objects have been set up
			if (dtClass.dtProp in initData && initData[dtClass.dtProp] instanceof Map) {
				universe = initData[dtClass.dtProp]
				delete initData[dtClass.dtProp]
			} else {
				universe = new Map()
			}
			// TODO: remove this sanity check. But the user may try to do this so we have to figure out how to detect and deal with that...
			if (universe.has(initData)) throw new Error(`Something is trying to instantiate a class with the same initial values object multiple times`)
			universe.set(initData, this)

			Object.keys(initData).forEach((p) => {
				if (!(p in dtClass.template)) {
					// Unmanaged properties just get dumped into the current object
					this[p] = initData[p]
					return
				}
				if (typeof initData[p] === 'object') {
					// This resolves circular references in initData
					if (universe.has(initData[p])) { // p should point to an already-instantiated object
						initData[p] = universe.get(initData[p])
					} else if (dtClass.dtProp in initData[p]) { // p should be a DataTrue object, but it hasn't yet been instantiated
						switch (typeof initData[p][dtClass.dtProp]) {
						case 'string':
							let DepClass = schema.lookupClass(initData[p][dtClass.dtProp])
							if (!DepClass) throw new Error(`Unknown DataTrue class: '${initData[p][dtClass.dtProp]}' for property: '${p}'`)
							initData[p][dtClass.dtProp] = universe
							initData[p] = new DepClass(initData[p]) // Instantiate but delay validation
							break
						case 'function':
							if (!schema.isDataTrueClass(initData[p][dtClass.dtProp])) throw new Error(`You appear to be mixing schemas. That's not allowed`) // Can we === schema objects?
							DepClass = initData[p][dtClass.dtProp]
							initData[p][dtClass.dtProp] = universe
							initData[p] = new DepClass(initData[p]) // Instantiate but delay validation
							break
						case 'object':
							// Looks like we're just initializing using a dataTrue object
							break
						default:
							throw new Error(`Attempt to initialize a DataTrue object with a sub-object that has a '${dtClass.dtProp}' property of unknown type '${typeof initData[p][dtClass.dtProp]}'`)
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
		if (validate) dtClass.atomicSet(() => { }, true)

		if (userConstructor) userConstructor.apply(this, arguments)
	} // END constructor

	const objProps = {}
	objProps[this.dtTmplProp] = { get: function() { return template }}
	Object.keys(template).forEach((name) => { 
		objProps[name] = genProp(name, template[name], dtClass) 
	})
	if (!(this.atomicSetProp in objProps)) {
		objProps[schema.atomicSetProp] = { value: function(setter) {
			return schema.atomicSet(setter)
		}}
	} else {
		if (schema.atomicSetProp === ATOMIC_SET_KEY) {
			console.warn(`You've defined '${ATOMIC_SET_KEY}' on your DataTrueClass, which dataTrue uses. This means you can't call the '${ATOMIC_SET_KEY}' method on objects of this DataTrue class. Alternativly, you can call 'atomicSet' on the DataTrue schema object or any DataTrue class, or choose a different name for the atomicSet method of your classes by defining 'atomicSet' option when instantiating DataTrue.`)
		} else {
			console.warn(`You've defined '${schema.atomicSetProp}' on your DataTrue class. You also set '${schema.atomicSetProp}' as the customized name for the atomicSet method in your schema. This means you can't call the '${ATOMIC_SET_KEY}' method of objects of this DataTrue class, since your property overrides the one you told DataTrue to use. Change the value of 'atomicSet' in the options you pass when instantiating the DataTrue schema object or just call 'atomicSet' on the DataTrue schema object itself or any DataTrue class insted of calling '${schema.atomicSetProp}' on objects of this DataTrue class.`)
		}
	}
	dtConstructor.prototype = Object.create(prototype, objProps)

	let set = {}
	let proto = prototype
	let chain = [dtConstructor.prototype]
	while (proto) {
		chain.unshift(proto) 
		proto = Object.getPrototypeOf(proto)
	}
	while (chain.length > 0) {
		proto = chain.shift()
		if (schema.dtTmplProp in proto) {
			Object.keys(proto[schema.dtTmplProp]).forEach(function(prop) {
				if ('default' in proto[schema.dtTmplProp][prop]) {
					set[prop] = { val: proto[schema.dtTmplProp][prop].default, block: false }
				} else if ('validate' in proto[schema.dtTmplProp][prop]) {
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

	Object.preventExtensions(dtConstructor)

	if (this.lookupClass(clName)) throw new Error(`A class named '${clName}' has already been defined`)
	let clObj = {
		dtConstructor: dtConstructor,
		dtClass: dtClass,
		name: clName,
	}
	this.classes.byName.set(clName, clObj)
	this.classes.byClass.set(dtClass, clObj)
	this.classes.byConstructor.set(dtConstructor, clObj)
	
	return dtConstructor
}
DataTrue.prototype = Object.create(Object.prototype, {
	// API entry point
	// usage: module.exports = dataTrue.createClass(...)
	createClass: { 
		value: createClass,
		writable: false,
		configurable: false,
	},
	isDataTrueObject: { value: function(obj) {
		return (typeof obj === 'object' &&
			this.dtProp in obj &&
			'DT_OBJECT_FLAG' in obj[this.dtProp] &&
			obj[this.dtProp].DT_OBJECT_FLAG === DT_OBJECT_FLAG)
	}},
	isDataTrueClass: { value: function(cl) { return this.lookupClass(cl) !== false }},
	getDataTrueClass: { value: function(obj) {
		if (!this.isDataTrueObject(obj)) throw new Error(`Attempt to get DataTrue class on a value that's not a DataTrue object`)
		return obj[this.dtProp].dtclass
	}},
	dtPrefix: { get: function() { return this.opts.dtPrefix } },
	dtProp: { get: function() { return this.dtPrefix } },
	dtTmplProp: { get: function() { return this.dtPrefix + 'Template' } },
	atomicSetProp: { get: function() { return this.opts.atomicSet } },
	atomicSet: { value: function(setter, inConstructor) {

		// TODO: remove this sanity check
		if (!inConstructor === true && this.validating !== false) throw new Error(`Internal Error: atomicSet called recursivly. That should be impossible`)
	
		// Run the user's setter function
		if (!(this.validating instanceof Map)) this.validating = new Map()
		setter([])
	
		// Call all validators
		let valid = true
		let cache = new Map()
		this.validating.forEach((errs, keyObj) => {
			let e = this.getDataTrueClass(keyObj).validate(keyObj, cache)
			if (e !== true) {
				valid = false
				this.validating.set(keyObj, e)
			}
		})
	
		// Accept or reject modified values
		this.validating.forEach((e, o) => {
			let cl = this.getDataTrueClass(o)
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
			if (cl) return cl.dtConstructor
			break
		case 'function':
			cl = this.classes.byConstructor.get(key)
			if (cl) return cl.dtConstructor // This is redundant, but...
			break
		case 'object':
			cl = this.classes.byClass.get(key)
			if (cl) return cl.dtConstructor
			break
		default:
			throw new Error(`Attempt to lookup class with key of unsupported type '${typeof key}': '${key}'`)
		}
		return false
	}},
})

const JS_DEFINE_PROP_KEYS = ['enumerable','writable','configurable']
const genProp = function(name, tmpl, dtcl) {

	if ('value' in tmpl) {
		if ('validate' in tmpl) throw new Error(`You defined both 'value' and 'validate' for the '${name}' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use 'default' instead. You should should generally only use 'value' to define methods of your DataTrue class.`)
		return tmpl
	}
	const getMunge = ('get' in tmpl)
		? tmpl.get
		: function(value) { return value }
	const setMunge = ('set' in tmpl)
		? tmpl.set
		: function(value) { return value }
	const prop = {
		configurable: false,
		get: function() {
			return getMunge(
				dtcl.dt.validating !== false && name in dtcl.newValues(this)
					? dtcl.newValues(this)[name].value
					: dtcl.data(this)[name]
			)
		},
		set: function(data) {
			data = setMunge(data)
			if (dtcl.dt.validating !== false) {
				// Look up the validator for this value
				let validate = false
				if ('validate' in tmpl) {
					validate = tmpl.validate
					// Add this object to the set of objects that must be validated
					if (!dtcl.dt.validating.has(this)) dtcl.dt.validating.set(this, {})
				}
				// Record the changed value
				dtcl.newValues(this)[name] = {
					value: data,
					validate: validate
				}
			} else {
				dtcl.atomicSet(() => {
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
	switch(typeof applyTo) {
	case 'function':
		this.applyTo = applyTo
		break
	case 'object':
		this.applyTo = function() { return applyTo }
		break
	default:
		if (arguments.length < 2) {
			this.applyTo = function() { return this }
		} else {
			throw new Error(`applyTo (2nd argument) must be a function, you gave me a '${typeof applyTo}'`)
		}
	}
}
Validator.prototype = Object.create(Object.prototype, {
	run: { value: function(obj, cache) {
		let applyTo = this.applyTo.apply(obj, [])
		if (cache.has(applyTo)) {
			if (cache.get(applyTo).has(this.validator)) {
				let result = cache.get(applyTo).get(this.validator)
				if (result instanceof Error) {
					throw result
				} else {
					return result
				}
			}
		} else {
			cache.set(applyTo, new Map())
		}
		try {
			cache.get(applyTo).set(this.validator, this.validator.apply(applyTo, []))
		} catch(e) {
			cache.get(applyTo).set(this.validator, e)
			throw e
		}
	}}
})

// DataTrueClass holds references to the template and the DataTrue schema object
class DataTrueClass {
	constructor(clName, template, dataTrue, proto) {
		this.name = clName
		this.dt = dataTrue
		this.proto = proto

		// Fixup the validate array. This allows the user to specify something simple for simple use cases
		Object.keys(template).forEach((prop) => {
			if ('validate' in template[prop]) {
				if ('value' in template[prop]) throw new Error(`You defined both 'value' and 'validate' for the '${prop}' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use 'default' instead of 'value'. You should should generally only use 'value' to define methods of DataTrue classes.`)
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
						throw new Error(`You requested that we call '${v}' on property '${prop}', but '${v}' is a property managed by DataTrue. We were expecting a function. Perhapse you wanted to make '${prop}' a method of your class by setting the 'value' key for that property to a function in your object template.`)
					} else {
						if (typeof template[v].value !== 'function') throw new Error(`You requested that we call '${v}' to validate property '${prop}', but '${v}' is a '${typeof template[v].value}', not a function`)
					}
					if ('writable' in template[v]) {
						if (!dataTrue.opts.writableValidatorMethods && template[v].writable) throw new Error(`You're using method ${v} as a validator for property ${prop}, but you're also trying to make the property ${v} writable. ${prop} MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the 'writableValidatorMethods' option to true when instantiating your DataTrue schema object.`)
					} else {
						template[v].writable = false
					}
					if ('configurable' in template[v]) {
						if (!dataTrue.opts.configurableValidatorMethods && template[v].configurable) throw new Error(`You're using method ${v} as a validator for property ${prop}, but you're also trying to make the property ${v} configurable. ${prop} MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the 'configurableValidatorMethods' option to true when instantiating your DataTrue schema object.`)
					} else {
						template[v].configurable = false
					}
					template[prop].validate[vname] = new Validator(template[v].value)
					break
				case 'function':
					template[prop].validate[vname] = new Validator(v)
					break
				case 'object':
					if (!(v instanceof Validator)) throw new Error(`You passed an object that wasn't a DataTrue.Validator as the validator named '${vname}' for property '${prop}'`)
					break
				default:
					throw new Error(`You passed something of type '${typeof v}' as the validator named '${vname}' for property '${prop}'. That doesn't make sense. Please see the DataTrue documentation.`)
				}
			})
		})
		this.template = template
		Object.freeze(this.template) // TODO: freeze is shallow. We really want a deep freeze, but...
	}

	// That property must have the same name on all DataTrue objects within a schema
	get dtProp() { return this.dt.dtProp }
	set dtProp(v) { throw new Error(`You may not change the DataTrue property after you instantiated a DataTrue schema. `) }

	data(obj) { return obj[this.dtProp]._ }

	newValues(obj) { 
		// TOOD: remove this sanity check
		if (this.dt.validating === false) throw new Error(`Internal Error: newValues called when we're not validating.`) // TODO: remove sanity check
		if (!('__' in obj[this.dtProp])) obj[this.dtProp].__ = {}
		return obj[this.dtProp].__ 
	}

	// obj - the object to be validated against this DataTrueClass template
	// errs - keys: name of value, values object with errors from each validator keyed by validator name
	// cache - cache of object/function pairs and results for which validation has already run -- Never run more than once
	validate(obj, cache) {
		let valid = true
		let errs = {}
		let newValues = this.newValues(obj)
		Object.keys(newValues).forEach((value) => {
			if (!newValues[value].validate) return
			Object.keys(newValues[value].validate).forEach((vname) => {
				try {
					newValues[value].validate[vname].run(obj, cache)
				} catch (e) {
					valid = false
					if (!(value in errs)) errs[value] = {}

					// TOOD: remote this sanity check
					if (vname in errs[value]) throw new Error(`Internal Error: validator '${vname}' already defined for property '${value}' on this object. That should be impossible.`)
					errs[value][vname] = e
				}
			})
		})
		return valid ? true : errs
	}

	acceptNewValues(obj) { 
		// TOOD: remove this sanity check
		if (this.dt.validating === false) throw new Error(`Internal Error: acceptNewValues called when we're not validating.`)
		Object.keys(this.newValues(obj)).forEach((value) => {
			this.data(obj)[value] = this.newValues(obj)[value].value
		})
		delete obj[this.dtProp].__
	}	

	rejectNewValues(obj) { 
		// TOOD: remove this sanity check
		if (this.dt.validating === false) throw new Error(`Internal Error: rejectNewValues called when we're not validating.`)
		delete obj[this.dtProp].__
	}

	init(obj) {
		Object.defineProperty(obj, this.dtProp, {
			value: {
				dt: this.dt,
				dtclass: this,
				_: {},
				DT_OBJECT_FLAG: DT_OBJECT_FLAG,
			},
		})
	}

	atomicSet(setter, inConstructor) {
		return this.dt.atomicSet(setter, inConstructor) 
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
			if (!this.exceptions.has(object)) false
			let oe = this.exceptions.get(object)
			if (!property) return oe
			if (!(property in oe)) false
			let pe = oe[property]
			if (validator === true) return pe
			if (validator === false) return Object.keys(pe).map((vname) => { return pe[vname] })
			if (!(validator in pe)) false
			return pe[validator]
		}})
		Object.freeze(this)
	}

}

export { 
	DataTrue as default, 
	AtomicSetError,
	Validator
}
