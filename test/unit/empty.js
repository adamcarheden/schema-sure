const Path = require('path')
import { test, setup } from './fixtures.js'

test(`Can instantiate simple empty SchemaSure class (${Path.basename(__filename)})`, (t) => {
	const fixtures = setup({
		Example: {}
	})
	var example // eslint-disable-line no-unused-vars
	t.doesNotThrow(() => {
		example = new fixtures.Example()
	}, 'Instantiate simple empty class created by SchemaSure')
	t.end()
})
