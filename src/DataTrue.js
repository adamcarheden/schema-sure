

// The DataTrue object represents the scheam to which all objects
// DataTrue objects that might potentially be related to each other must belong.
// At present, it's just a place to store the name of the special DataTrue key
// we put on every DataTrue object and, so long as that name matches, things should
// work fine among objects with different DataTrue instances, but it may have a
// grander purposes in the future.
const DATA_TRUE_KEY = 'DataTrue'
const defaultOpts = {
	dtprop: DATA_TRUE_KEY,
	allowExtensions: false,
}
const merge = require('merge')
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
const createClass = function(template = {}, constructor = function() {}, prototype = Object.prototype) {

	if (typeof template !== 'object') throw new Error(`Object properties must be an object. You gave me a '${typeof template}'`)
	if (typeof constructor !== 'function') throw new Error(`Constructor must be a function. You gave me a '${typeof constructor}'`)

	if (this.opts.dtprop in template) {
		throw new Error(`You may not define a class that defines the property '${this.opts.dtprop}'. If you must use a property of that name, change the name used by DataTrue by defining 'dtprop' in the options used when you instantiate your DataTrue schema object.`)
	}
	
	const dtClass = new DataTrueClass(template, this)

	const dtConstructor = function() {

		dtClass.init(this)

		var args = Array.prototype.slice.call(arguments)
		var initData = args.shift()
		var set = {}
		Object.keys(template).forEach((prop) => {
			if ('default' in template[prop]) {
				set[prop] = template[prop].default
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

		// At best, mixing managed DataTrue managed objects and properties with
		// unmanaged ones will be difficult to reason about. But we shouldn't 
		// make it impossible for users to try.
		if (!dtClass.dt.opts.allowExtensions) Object.preventExtensions(this)
	
		if (constructor) constructor.apply(this, args)

	}

	dtConstructor.prototype = Object.create(prototype, Object.keys(template).map((name) => { 
		return genProp(name, template[name], dtClass) 
	}))
	
	return dtConstructor
}
DataTrue.prototype = Object.create(Object.prototype, {
	// API entry point
	// usage: module.exports = dataTrue.createClass(...)
	createClass: { 
		value: createClass,
		writable: false,
		configurable: false,
	}
})

const JS_DEFINE_PROP_KEYS = ['enumerable','writable','configurable']
// This is mirrored by object properties created by createFakeObject
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
const deepFreeze = require('deep-freeze')
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
				if (!(v in this.template)) throw new Error(`You requested that we call '${v}' on property '${prop}', but there is no such method defined.`)
				if (!('value' in this.template[v])) {
					if (typeof this.template[v].value !== 'function') throw new Error(`You requested that we call '${v}' on property '${prop}', but '${v}' is property managed by DataTrue. We don't suppor that. Perhapse you wanted to set a static value for '${prop}' by setting the 'value' key for that property in your object template instead.`)
				} else {
					if (typeof this.template[v].value !== 'function') throw new Error(`You requested that we call '${v}' on property '${prop}', but '${v}' is a '${typeof this.template[v]}', not a function`)
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
	deepFreeze(template)
	this.template = template
	Object.freeze(this)
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
		value: function(obj) {
			obj[this.dtprop] = {
				dt: this,
				_: {},
			}
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
	const fake = createFakeObject(obj, dtcl)

	// Call setter on fake object
	setter.apply(fake.object, [])

	// Run validations on anything modified by setter in fake object, collection exceptions as we go
	var exceptions = {}
	Object.keys(dtcl.template).forEach((prop) => {
		// TODO: If this is another DataTrue object, call it's set method instead
		dtcl.template[prop].validate.forEach((validator) => {
			var vobj = validator.applyTo.apply(fake.object,[])
			try {
				validator.validate.apply(vobj,[])
			} catch (e) {
				if (!(prop in exceptions)) exceptions[prop] = []
				exceptions[prop].push(e)
			}
		})
	})

	// Throw exceptions if there were any
	console.log({except: exceptions})
	if (Object.keys(exceptions).length > 0) throw exceptions

	// Push modified values to real object
	dtcl.push(obj, fake.newValues)
}

const createFakeObject = function(real, dtcl) {
	const FakeObject = function() { }
	var objProps = {}
	objProps[dtcl.dtprop] = {
		get: function() { throw new Error(`Setter functions may not access the DataTrue property (${dtcl.dtprop})`) },
		set: function() { throw new Error(`The DataTrue property may never be changed after instantiating an DataTrue object`) },
		configurable: false,
	}
	var newValues = {}
	// This mirrors the object properties created by genProp
	// Changes made there may require changes here too
	Object.keys(dtcl.template).forEach((prop) => {
		const getMunge = ('get' in dtcl.template[prop])
			? dtcl.template[prop].get
			: function(value) { return value }
		const setMunge = ('set' in dtcl.template[prop])
			? dtcl.template[prop].set
			: function(value) { return value }
		objProps[prop] = {
			configurable: false,
			get: function() {
				return getMunge(
					(prop in newValues)
						? newValues[prop]
						: real[prop]
				)
			},
			set: function(data) {
				newValues[prop] = setMunge(data)
			}
		}
	})
	FakeObject.prototype = Object.create(Object.prototype, objProps)

	return {
		object: new FakeObject(),
		newValues: newValues,
	}
}

module.exports = DataTrue
