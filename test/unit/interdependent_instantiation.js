import {
	test,
	DataTrue
} from './fixtures.js'

test(`Instantiate interdependent objects`,(t) => {
	const schema = new DataTrue()
	const aMsg = `a is not an A`
	const bMsg = `b is not a B`
	const aType = 'aaa'
	const bType = 'bbb'
	const A = schema.createClass('A', {
		b: {
//			validate: function() { if (!(B.isPrototypeOf(this.b))) throw new Error(aMsg) }
			validate: function() { if (typeof this.b !== 'object' || this.b.mytype !== bType) throw new Error(bMsg) }
		},
		mytype: { value: aType },
	})
	const B = schema.createClass('B', {
		a: {
//			validate: function() { if (!(A.isPrototypeOf(this.a))) throw new Error(`${bMsg}: ${this.a}`) }
			validate: function() { if (typeof this.a !== 'object' || this.a.mytype !== aType) throw new Error(aMsg) }
		},
		mytype: { value: bType },
	})

	let a
	t.throws(() => {
		a = new A()
	}, new RegExp(bMsg), `Can't instantiate an A without a B`)
	t.equal(typeof a,'undefined',`a is not defined`)
	t.throws(() => {
		let b = new B() // eslint-disable-line no-unused-vars
	}, new RegExp(aMsg), `Can't instantiate a B without an A`)
	t.equal(typeof b,'undefined',`b is not defined`)

	let inita = {}
	let initb = {}
	initb[schema.dtProp] = B
	initb.a = inita
	inita.b = initb
	a = false
	t.doesNotThrow(() => {
		a = new A(inita)
	}, `Can create related objects at once`)
	if (a) {
		t.assert(a.b instanceof B, `Datatrue object b instantiated`)
		t.assert(a.b.a === a, `dataTrue objects correctly link`)
	}

	t.end()
})
