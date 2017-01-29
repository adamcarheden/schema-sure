import test from 'tape'
import SchemaSure, { AtomicSetError, Validator } from '../../src/SchemaSure'

const setup = (classes) => {
	const schema = new SchemaSure()
	var fixtures = {
		SchemaSure: SchemaSure,
		schema: schema,
	}
	Object.keys(classes).forEach((name) => {
		fixtures[name] = schema.createClass(name, classes[name])
	})
	return fixtures
}

const checkSSException = function(t, ex, expect) {
	if (!(ex instanceof Error)) {
		t.fail(`Test infrastructure: Error object passed to checkSSException is an Error`)
		return false
	}
	if (ex instanceof AtomicSetError) {
		t.fail(`Error thrown by SchemaSure is an AtomicSetError: ${ex}\n${ex.stack}`)
		return false
	}
	if (!('exceptions' in ex)) {
		t.fail(`AtomicSetError has an exceptions property`)
		return false
	}
	if (!(ex.exceptions instanceof Map)) {
		t.fail(`The exceptions property of AtomicSetError is a Map`)
		return false
	}
	let keys = ex.exceptions.keys()
	if (keys.length >= 1) {
		t.fail(`AtomicSetError.exceptions isn't empty`)
		return false
	}
	var ok = true
	ex.exceptions.forEach((v,ko) => {
		if (typeof ko !== 'object') {
			t.fail(`All AtomicSetError exception keys are objects`)
			ok = false
		}
		let failTmpl = false
		if (expect) {
			if (expect instanceof Map) {
				if (expect.has(ko)) {
					failTmpl = expect.get(ko)
				} else {
					t.fail(`Object was invalid`)
					ok = false
				}
			} else {
				failTmpl = expect
			}
		}
		if (typeof v !== 'object') {
			t.fail(`All AtomicSetError exception values are objects`)
			ok = false
		}
		Object.keys(failTmpl).forEach(function(value) {
			if (!(value in v)) {
				t.fail(`Exception should be thrown for value '${value}'`)
				ok = false
			}
		})
		Object.keys(v).forEach(function(value) {
			if (typeof v[value] !== 'object') {
				t.fail(`Exceptions for value '${value}' is an object`)
				ok = false
				return
			}
			let vnames
			if (failTmpl) {
				if (!(value in failTmpl)) {
					t.fail(`No exception should have been thrown for value '${value}'`)
					ok = false
				} else {
					vnames = failTmpl[value]
				}
			}
			let cnt = 0
			if (vnames) {
				Object.keys(vnames).forEach(function(vname) {
					if (!(vname in v[value])) {
						t.fail(`Validator '${vname}' of property '${value}' should an exception`)
						ok = false
					}
				})
			}
			Object.keys(v[value]).forEach(function(vname) {
				if (vnames) {
					if (!(vname in vnames)) {
						t.fail(`Validator '${vname}' for property '${value}' should not throw an exception`)
						ok = false
					}
				} else if (++cnt > 1) {
					t.fail(`Multiple validators, including '${vname}', threw exceptions for property '${value}'. Expecting just 1`)
					ok = false
				}
				if (!(v[value][vname] instanceof Error)) {
					t.fail(`The thing thrown by validator '${vname}' of value '${value}' is of type Error`)
					ok = false
					return
				}
			})
		})
	})
	return ok
}
const getEx = function(t, e, prop) {
	let c1 = 0
	let ex = false
	e.exceptions.forEach((v, ko) => {
		if (++c1 !== 1) {
			t.fail(`Exceptions thrown for just one object`)
			return
		}
		if (prop in v) {
			let c2 = 0
			Object.keys(v[prop]).forEach(function(k) {
				if (++c2 !== 1) {
					t.fail(`Expect one exception to be thrown for property '${prop}'`)
					return
				}
				ex = v[prop][k]
			})
		} else {
			t.fail(`Expect exceptions to be thrown for property '${prop}'`)
			return
		}
	})
	return ex
}

export {
	test,
	SchemaSure,
	AtomicSetError,
	Validator,
	setup,
	checkSSException,
	getEx
}
