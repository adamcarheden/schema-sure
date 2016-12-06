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
	Object.freeze(this) // We're really just a static shared config. Don't touch that!
}
const DATA_TRUE_KEY = 'DataTrue'
const defaultOpts = {
	dtprop: DATA_TRUE_KEY,
	allowExtensions: false,
}

const createClass = function(template = {}, constructor = function() {}, prototype = Object.prototype) {

	if (typeof template !== 'object') throw new Error(`Object properties must be an object. You gave me a '${typeof template}'`)
	if (typeof constructor !== 'function') throw new Error(`Constructor must be a function. You gave me a '${typeof constructor}'`)

	if (this.opts.dtprop in template) {
		throw new Error(`You may not define a class that defines the property '${this.opts.dtprop}'. If you must use a property of that name, change the name used by DataTrue by defining 'dtprop' in the options used when you instantiate your DataTrue schema object.`)
	}
	
	const dtClass = new DataTrueClass(template, this)

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
		if (initData) {
			Object.keys(initData).forEach((p) => {
				if (!(p in dtClass.template)) {
					// Unmanaged properties just get dumped into the current object
					this[p] = initData[p]
					return
				} else {
					set[p] = initData[p]
				}
			})
		}
		dtClass.set(this, function() {
			Object.keys(set).forEach((k) => {
				// TODO: If the template says the value is another DataTrue object, 
				// we need to do call new foobar(set[k])
				this[k] = set[k]
			})
		})

		if (constructor) constructor.apply(this, args)

	}

	const objProps = {}
	Object.keys(template).forEach((name) => { 
		objProps[name] = genProp(name, template[name], dtClass) 
	})
	dtConstructor.prototype = Object.create(prototype, objProps)
	Object.preventExtensions(dtConstructor)
	
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
		return (typeof obj === 'object' && this.opts.dtprop in obj)
	}},
	getDataTrueClass: { value: function(obj) {
		if (!this.isDataTrueObject(obj)) throw new Error(`Attempt to get DataTrue class on a value that's not a DataTrue object`)
		return obj[this.opts.dtprop].dtclass
	}},
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
		if (!('validate' in template[prop])) {
			template[prop].validate = []
			return
		}
		if (!Array.isArray(template[prop].validate)) template[prop].validate = [template[prop].validate]
		template[prop].validate = template[prop].validate.map((v) => {
			switch (typeof v) {
			case 'string':
				if (!(v in this.template)) throw new Error(`You requested that we call '${v}' on property '${prop}', but there is no such method defined.`) // TODO: did we even write code to support calling a method?
				if (!('value' in this.template[v])) {
					throw new Error(`You requested that we call '${v}' on property '${prop}', but '${v}' is a property managed by DataTrue. We were expecting a function. Perhapse you wanted to make '${prop}' a method of your class by setting the 'value' key for that property to a function in your object template.`)
				} else {
					if (typeof this.template[v].value !== 'function') throw new Error(`You requested that we call '${v}' to validate property '${prop}', but '${v}' is a '${typeof this.template[v].value}', not a function`)
				}
				return { 
					validate: this.template[v].value,
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
		get: function() { return this.dt.opts.dtprop },
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
				// TODO: If template says prop is a DT object, call push on that object instead
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

const getOrCreateFakeObject = function(r, c, u) {
	let idx = u.map(function(i) { return i.real }).indexOf(r)
	if (idx >= 0) return u[idx]
	return new FakeObject(r, c.dt.getDataTrueClass(r), u)
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
	Fake.prototype = Object.create(Object.prototype, objProps)
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
		Object.keys(this.dataTrueClass.template).forEach((prop) => {
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
				if (match > -1 && results.map((t) => { return t.validate }).indexOf(validator.validate) === match) {
					if (typeof results[match].result === 'object' && results[match].result instanceof Error) {
						exceptions[prop].push(results[match].result)
					}
					return
				}
				try {
					res.results = validator.validate.apply(vobj,[])
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
