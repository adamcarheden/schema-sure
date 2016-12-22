import merge from 'merge'

// The DataTrue object represents the scheam to which all objects
// DataTrue objects that might potentially be related to each other must belong.
// At present, it's just a place to store the name of the special DataTrue key
// we put on every DataTrue object and, so long as that name matches, things should
// work fine among objects with different DataTrue instances, but it may have a
// grander purposes in the future.
const DataTrue = function(opts = {}) {
	if (typeof opts !== 'object') throw new Error(`First argument, opts, to DataTrue should be an object. You gave me a '${typeof opts}'`)
	Object.keys(opts).forEach((k) => {
		if (!(k in defaultOpts)) throw new Error(`Unknown DataTrue option: '${k}'`)
	})
	// Yes, we really do want to freeze the original the user passed to us. It best not change.
	// That does make changes the user attempts later fail, but that's a no-no, so...
	merge(opts, defaultOpts)
	Object.freeze(opts) // Hard to predict what would happen if opts is modified, but it's almost certainly bad.
	this.opts = opts

	this.classes = []

	Object.freeze(this) // We're really just a static shared config. Don't touch that!
}
const DATA_TRUE_KEY = 'DataTrue'
const defaultOpts = {
	dtprop: DATA_TRUE_KEY,
	writableValidatorMethods: false,
	configurableValidatorMethods: false,
}
// This key/value is added to the dtprop key of each dataTrue object and serves
// to distinguish instantiated DataTrue objects from objects that have a dtprop because
// they've been deserialized but haven't yet been passed to the constructor of the
// appropriate class. Maybe a bit overkill, but it ensures isDataTrueObject()
// can work as expected
const DT_OBJECT_FLAG = 'This is a DataTrue Object'

const createClass = function(template = {}, userConstructor = function() {}, prototype = Object.prototype) {

	if (typeof template !== 'object') throw new Error(`Object properties must be an object. You gave me a '${typeof template}'`)
	if (typeof userConstructor !== 'function') throw new Error(`Constructor must be a function. You gave me a '${typeof userConstructor}'`)

	if (this.dtprop in template) {
		throw new Error(`You may not define a class that defines the property '${this.dtprop}'. If you must use a property of that name, change the name used by DataTrue by defining 'dtprop' in the options used when you instantiate your DataTrue schema object.`)
	}
	
	const dtClass = new DataTrueClass(template, this)

	const schema = this
	const dtConstructor = function() {
		dtClass.init(this, dtClass)

		var args = Array.prototype.slice.call(arguments)
		var initData = args.shift()
		var set = {}
		Object.keys(template).forEach((prop) => {
			if ('default' in template[prop]) {
				set[prop] = template[prop].default
			} else {
				// This ensures all validators get called, since some may check for undefined values
				set[prop] = undefined
			}
		})
		let validate = true
		if (initData) {

			// This indicates the constructor was called by the constructor of related
			// DataTrue object. We skip validation, as that constructor will do so once
			// all realted objects have been set up
			let universe
			let uspec = {initData: initData, dtObject: this }
			if (dtClass.dtprop in initData && Array.isArray(initData[dtClass.dtprop])) {
				validate = false
				universe = initData[dtClass.dtprop]
				delete initData[dtClass.dtprop]
			} else {
				universe = [ uspec ]
			}

			Object.keys(initData).forEach((p) => {
				if (!(p in dtClass.template)) {
					// Unmanaged properties just get dumped into the current object
					this[p] = initData[p]
					return
				}
				if (typeof initData[p] === 'object') {
					// This resolves circular references in initData
					let i = universe.map(function(j) { return j.initData }).indexOf(initData[p])
					if (i >= 0) {
						initData[p] = universe[i].dtObject
					} else if (dtClass.dtprop in initData[p]) {
						switch (typeof initData[p][dtClass.dtprop]) {
						case 'string':
							throw new Error(`Deserializing data true objects using class names not yet implemented. Offending property: '${p}'`)
						case 'function':
							if (!schema.isDataTrueClass(initData[p][dtClass.dtprop])) {
								throw new Error(`You appear to be mixing schemas. That's not allowed`)
							}
							universe.push(uspec)
							let DepClass = initData[p][dtClass.dtprop]
							initData[p][dtClass.dtprop] = universe
							initData[p] = new DepClass(initData[p])
							break
						case 'object':
							// Looks like we're just initializing using a dataTrue object
							break
						default:
							throw new Error(`Attempt to initialize a DataTrue object with a sub-object that has a '${dtClass.dtprop}' property of unknown type '${typeof initData[p][dtClass.dtprop]}'`)
						}
					}
				}
				set[p] = initData[p]
			})
		}
		if (validate) {
			dtClass.set(this, function() {
				Object.keys(set).forEach((k) => {
					this[k] = set[k]
				})
			})
		} else {
			Object.keys(set).forEach((k) => {
				dtClass.data(this)[k] = set[k]
			})
		}

		if (userConstructor) userConstructor.apply(this, args)

	}

	const objProps = {}
	Object.keys(template).forEach((name) => { 
		objProps[name] = genProp(name, template[name], dtClass) 
	})
	dtConstructor.prototype = Object.create(prototype, objProps)
	Object.preventExtensions(dtConstructor)

	this.classes.push({
		dtClass: dtClass,
		dtConstructor: dtConstructor,
	})
	
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
			this.dtprop in obj &&
			'DT_OBJECT_FLAG' in obj[this.dtprop] &&
			obj[this.dtprop].DT_OBJECT_FLAG === DT_OBJECT_FLAG)
	}},
	isDataTrueClass: { value: function(obj) {
		return this.classes.map(function(i) { return i.dtConstructor }).indexOf(obj) >= 0
	}},
	getDataTrueClass: { value: function(obj) {
		if (!this.isDataTrueObject(obj)) throw new Error(`Attempt to get DataTrue class on a value that's not a DataTrue object`)
		return obj[this.dtprop].dtclass
	}},
	set: { value: function(obj, setter) {
		if (typeof obj === 'function') throw new Error(`You called DataTrue.set() with a function as the first argument. The first argument should be an instance of a DataTrue object. The second argument is you setter function. Please see the documentation.`)
		return this.getDataTrueClass(obj).set(obj, setter)
	}},
	dtprop: { get: function() { return this.opts.dtprop } }
})

const JS_DEFINE_PROP_KEYS = ['enumerable','writable','configurable']
// This is mirrored by object properties created by FakeObject
// Change here may require changes there too
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
			var data = dtcl.data(this)[name]
			data = getMunge(data)
			return data
		},
		set: function(data) {
			dtcl.set(this, function() {
				this[name] = setMunge(data)
			})
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


// DataTrueClass holds references to the template and the DataTrue schema object
const DataTrueClass = function(template, dataTrue) {
	this.dt = dataTrue
	// Fixup the validate array. This allows the user to specify something simple for simple use cases
	Object.keys(template).forEach((prop) => {
		if ('validate' in template[prop]) {
			if ('value' in template[prop]) throw new Error(`You defined both 'value' and 'validate' for the '${prop}' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use 'default' instead of 'value'. You should should generally only use 'value' to define methods of DataTrue classes.`)
		} else {
			if ('value' in template[prop]) return
			template[prop].validate = []
			return
		}
		if (!Array.isArray(template[prop].validate)) template[prop].validate = [template[prop].validate]
		template[prop].validate = template[prop].validate.map((v) => {
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
				return { 
					validate: template[v].value,
					applyTo: function() { return this }, 
				}
			case 'function':
				return {
					validate: v,
					applyTo: function() { return this }, 
				}
			case 'object':
				if (!('validate' in v)) {
					throw new Error(`You passed an object to validate for property '${prop}' with no validate key`)
				} else if (typeof v.validate !== 'function') {
					throw new Error(`The 'validate' key on validate for property '${prop}' is a '${typeof v.applyTo}'. It should be a function.`)
				}
				if (!('applyTo' in v)) {
					v.applyTo = function() { return this } 
				} else if (typeof v.applyTo !== 'function') {
					throw new Error(`The 'applyTo' key on validate for property '${prop}' is a '${typeof v.applyTo}'. It should be a function.`)
				}
				return v
			default:
				throw new Error(`You passed something of type '${typeof v}' in the validate key for property '${prop}'. That doesn't make sense. Please see the DataTrue documentation.`)
			}
		})
	})
	this.template = template
	//Object.freeze(this)
}
// DataTrueClass also contains methods for accessing and manipulating the 
// special DataTrue property of DataTrue objects
DataTrueClass.prototype = Object.create(Object.prototype, {
	// This returns the name of the special DataTrue property created on all DataTrue objects
	// That property must have the same name on all DataTrue objects within a schema
	dtprop: { 
		get: function() { return this.dt.dtprop },
		set: function(v) { throw new Error(`You may not change the DataTrue property after you instantiated a DataTrue schema. `) },
		configurable: false,
	},
	data: { 
		value: function(obj) { return obj[this.dtprop]._ },
		writable: false,
		configurable: false,
	},
	init: { 
		value: function(obj, dtclass) {
			Object.defineProperty(obj, this.dtprop, {
				value: {
					dt: this,
					dtclass: dtclass,
					_: {},
					DT_OBJECT_FLAG: DT_OBJECT_FLAG,
				},
				enumerable: false,
				configurable: false,
				writable: false,
			})
		},
		writable: false,
		configurable: false,
	},
	set: {
		value: function(obj, setter) { return atomicSet(obj, setter, this) },
		writable: false,
		configurable: false,
	},
	push: {
		value: function(obj, newValues) {
			Object.keys(newValues).forEach((prop) => {
				this.data(obj)[prop] = newValues[prop]
			})
		},
		writable: false,
		configurable: false,
	}
})
const atomicSet = function(obj, setter, dtcl) {
	// We don't actually call the setter or validation on the real object
	// Instead we create a proxy object that appears to be the real object to those functions
	// but instead keeps record of the changes.
	const fake = new FakeObject(obj, dtcl)

	// Call setter on fake object
	setter.apply(fake.fake, [])

	// This will throw an AtomicSetError if anything is invalid
	fake.validate()

	// Push modified values to real object
	dtcl.push(obj, fake.newValues)

	// TODO: If you modify DataTrue objects not related to the object passed to schema.set()
	// Those objects get set in a non-atomic way (i.e. atomicSet is called recursivly in setter function)
	// While that would be easy to detect and fix, what would the resulting exceptions object look like?
	// Since it's organized by relation to the object passed to schema.set(), there's no logical place to put
	// exceptions thrown by non-related objects.
	// I think there's probably no real use case for modifying unrelated objects in a single atomic set, but 
	// it does mean our user has to both know not to do that and be able to predict which objects are related
	// in order to code accordingly.
	// We could accept an array of objects instead of just one, but what if two objects in the array were related?
	// We'd have to ensure the exception object was put in the right place in BOTH of the AtomicSetError exceptions
	// objects.
	// Since I don't think users will likely do such things, we'll leave that as a v2.0 feature.
	// Detecting and warning about it may be a release blocking requirement though.
}

class AtomicSetError extends Error {
	constructor(exceptions) {
		var msgs = []
		if (Object.keys(exceptions).length === 1 && exceptions[Object.keys(exceptions)[0]].length === 1) {
			// If we just have one exception, make this look like that
			msgs.push(exceptions[Object.keys(exceptions)[0]][0].message)
		} else {
			Object.keys(exceptions).forEach(function(prop) {
				if (Array.isArray(exceptions[prop])) {
					msgs = msgs.concat(exceptions[prop].map(function(e) {
						return `${prop}: ${e.message}`
					}))
				} else {
					msgs = msgs.concat(exceptions[prop].message)
				}
			})
		}
		super(msgs.join(`\n`))
		// instanceof doesn't work for subclasses in babel, apparently 
		// even with babel-plugin-transform-builtin-extend, which isn't even supposed to work for ie<=10 anyway
		// This provides a way to test for this Error subclass until es6 is born for real
		this.AtomicSetError = true
		this.exceptions = exceptions
		this.messages = msgs
		Object.freeze(this)
	}
}

const getOrCreateFakeObject = function(real, dtcl, univ) {
	let idx = univ.map(function(i) { return i.real }).indexOf(real)
	if (idx >= 0) return univ[idx]
	return new FakeObject(real, dtcl.dt.getDataTrueClass(real), univ)
}
const FakeObject = function(real, dtcl, universe = []) {
	this.validated = false
	this.newValues = {}
	this.relatedObjects = {}
	this.universe = universe // This is an array of all related fake objects. We use it to ensure only 1 fake object is ever created for any real object
	universe.push(this)
	this.real = real
	this.dataTrueClass = dtcl
	this.frozen = false
	const Fake = function() {}

	var objProps = {}
	objProps[dtcl.dtprop] = {
		get: function() { throw new Error(`Setter functions may not access the DataTrue property (${dtcl.dtprop})`) },
		set: function() { throw new Error(`The DataTrue property may never be changed after instantiating an DataTrue object`) },
		configurable: false,
	}
	// This mirrors the object properties created by genProp
	// Changes made there may require changes here too
	const fakeObj = this
	const pdesc = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(real))
	Object.keys(dtcl.template).forEach((prop) => {
		const getMunge = ('get' in dtcl.template[prop])
			? dtcl.template[prop].get
			: function(value) { return value }
		const setMunge = ('set' in dtcl.template[prop])
			? dtcl.template[prop].set
			: function(value) { return value }
		objProps[prop] = {
			configurable: false,
			enumerable: pdesc.enumerable,
			get: function() {
				let val
				if (prop in fakeObj.relatedObjects) {
					val = fakeObj.relatedObjects[prop]
				} else if (prop in fakeObj.newValues) {
					val = fakeObj.newValues[prop]
				} else {
					val = real[prop]
				}
				return getMunge(val, this)
			},
			set: function(data) {
//				if (!pdesc.writable) {
//					console.warn(`Attempt to write to read-only property '${prop}' in validator function has no effect.`);
//					return
//				}
				data = setMunge(data, this)
				fakeObj.newValues[prop] = data
				if (dtcl.dt.isDataTrueObject(data)) {
					const relFake = getOrCreateFakeObject(data, dtcl.dt.getDataTrueClass(data), fakeObj.universe)
					fakeObj.relatedObjects[prop] = relFake.fake
				} else if (prop in fakeObj.relatedObjects) {
					delete fakeObj.relatedObjects[prop]
				}
			}
		}
	})
	Fake.prototype = Object.create(Object.getPrototypeOf(real), objProps)
	this.fake = new Fake()
	Object.preventExtensions(this)
	Object.freeze(this.fake)
	
	// Create fake objects for all related objects
	// Note: this must be done here, AFTER we've instantiated Fake() for the current object
	Object.keys(dtcl.template).forEach((prop) => {
		if (this.dataTrueClass.dt.isDataTrueObject(real[prop])) {
			const relFake = getOrCreateFakeObject(real[prop], dtcl.dt.getDataTrueClass(real[prop]), universe)
			this.relatedObjects[prop] = relFake.fake
		}
	})
}
FakeObject.prototype = Object.create(Object.prototype, {
	isFakeObject: { value: true, enumerable: true, configurable: false },
	freeze: { value: function() { 
		if (this.frozen) return
		this.universe.forEach(function(o) { 
			Object.freeze(o.fake) 
			Object.freeze(o.relatedObjects) 
			Object.freeze(o.universe) 
			Object.freeze(o.newValues) 
			o.frozen = true
		}) 
	}},
	validate: { value: function(results = []) {

		this.freeze() // Once validation starts, nothing may change

		// Run validations on anything modified by setter in fake object, collecting exceptions as we go
		var exceptions = {}
		Object.keys(this.newValues).forEach((prop) => {
			if ('value' in this.dataTrueClass.template[prop]) return // Validation can't occur if the user sets a value directly
			this.dataTrueClass.template[prop].validate.forEach((validator) => {
				let vobj = validator.applyTo.apply(this.fake, [])
				if (vobj === false) return
				let res = {
					vobj: vobj,
					validate: validator.validate,
				}
				if (typeof vobj !== 'object') {
					if (!(prop in exceptions)) exceptions[prop] = []
					var e = new Error(`The applyTo function returned a '${typeof vobj}', expecting an object. If you want to skip validation under certain conditions, such as if the object your validator applies to hasn't been assigned to, have your applyTo function return false`)
					exceptions[prop].push(e)
					res.result = e
				}
				let match = results.map((t) => { return t.vobj }).indexOf(vobj)
				// Ensure we only run each validator function against an object once
				if (results.reduce(function(acc, cv, i) {
					return (cv.vobj === vobj && cv.validate === validator.validate) || acc
				}, false)) {
					if (typeof results[match].result === 'object' && results[match].result instanceof Error) {
						exceptions[prop].push(results[match].result)
					}
					return
				}
				try {
					res.results = validator.validate.apply(vobj, [])
				} catch (e) {
					if (!(prop in exceptions)) exceptions[prop] = []
					exceptions[prop].push(e)
					res.result = e
				}
				results.push(res)
			})
		})

		Object.keys(this.relatedObjects).forEach((r) => {
			if (!this.relatedObjects[r].validated) return
			try {
				this.relatedObjects[r].validate(results)
			} catch (e) {
				if (!('AtomicSetError' in e)) throw e
				if (r in exceptions) e.exceptions[this.dataTrueClass.dtprop] = exceptions[r]
				exceptions[r] = e
			}
		})

		// Throw exceptions if there were any
		if (Object.keys(exceptions).length > 0) throw new AtomicSetError(exceptions)

		this.validated = true

	}}
})

DataTrue.AtomicSetError = AtomicSetError

export default DataTrue
