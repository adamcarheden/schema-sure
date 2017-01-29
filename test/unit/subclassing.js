const Path = require('path')
import {
	test, setup
} from './fixtures.js'

test(`Subclassing (${Path.basename(__filename)})`, (t) => {
	const fixtures = setup({})
	let gmsg = `gval must be > 10`
	let pmsg = `pval must be > 10`
	let cmsg = `cval must be > 10`
	let gdfl = 0
	let pdfl = 1
	let cdfl = 2
	let gvalid = 3
	let pvalid = 4
	let cvalid = 5
	let gcall = 0
	let pcall = 0
	let ccall = 0
	const Gramps = fixtures.schema.createClass('Gramps', {
		gval: {
			validate: function() {
				gcall += 1
				if (this.gval > 10) throw new Error(gmsg)
			},
			default: gdfl,
		}
	})
	const Parent = fixtures.schema.createClass('Parent', {
		pval: {
			validate: function() {
				pcall += 1
				if (this.pval > 10) throw new Error(pmsg)
			},
			default: pdfl,
		},
		cval: {
			validate: function() {
				if (this.cval < 10) throw new Error(`Parent cval called. That should't happen`)
			},
			default: 42,
		}
	},undefined,Gramps.prototype)
	const Child = fixtures.schema.createClass('Child', {
		cval: {
			validate: function() {
				ccall += 1
				if (this.cval > 10) throw new Error(cmsg)
			},
			default: cdfl,
		}
	},undefined,Parent.prototype)
	// TODO: Add non-ss class somewhere in the middle

	let obj
	t.doesNotThrow(function() {
		obj = new Child()
	})
	t.assert(obj instanceof Child,`Object is an instance of Child`)
	t.assert(obj instanceof Parent,`Object is an instance of Parent`)
	t.assert(obj instanceof Gramps,`Object is an instance of Gramps`)
	t.assert('cval' in obj,`Object has a cval`)
	t.assert('pval' in obj,`Object has a pval`)
	t.assert('gval' in obj,`Object has a gval`)
	t.equal(obj.cval, cdfl, `Child object default value set`)
	t.equal(obj.pval, pdfl, `Parent object default value set`)
	t.equal(obj.gval, gdfl, `Grandparent object default value set`)
	t.equal(ccall,1,`Child validator called at init`)
	t.equal(pcall,1,`Parent validator called at init`)
	t.equal(gcall,1,`Gramps validator called at init`)
	t.throws(function() {
		obj.cval = 11
	},new RegExp(cmsg),`Invalid child value throws`)
	t.equal(obj.cval,cdfl,`Invalid child value not set`)
	t.equal(ccall,2,`Child validator called for invalid value`)
	t.throws(function() {
		obj.pval = 11
	},new RegExp(pmsg),`Invalid child value throws`)
	t.equal(obj.pval,pdfl,`Invalid parent value not set`)
	t.equal(pcall,2,`Parent validator called for invalid value`)
	t.throws(function() {
		obj.gval = 11
	},new RegExp(gmsg),`Invalid gramps validator throws`)
	t.equal(obj.gval,gdfl,`Invalid grandparent value not set`)
	t.equal(gcall,2,`Gramps validator called for invalid value`)
	t.doesNotThrow(function() {
		obj.cval = cvalid
	},`Valid child value does not throw`)
	t.equal(obj.cval,cvalid,`Valid child value set`)
	t.equal(ccall,3,`Child validator called for valid value`)
	t.doesNotThrow(function() {
		obj.pval = pvalid
	},`Valid parent value does not throw`)
	t.equal(obj.pval,pvalid,`Valid parent value set`)
	t.equal(pcall,3,`Parent validator called for valid value`)
	t.doesNotThrow(function() {
		obj.gval = gvalid
	},`Valid gramps value does not throw`)
	t.equal(obj.gval,gvalid,`Valid gramps value set`)
	t.equal(gcall,3,`Gramps validator called for valid value`)

	t.end()
})

// TODO: test all the different ways to set a validator: string, function, new Validator * ( unnamed, multiple named )
// TODO: test instantiating using the string name of a class instead of it's constructor object
