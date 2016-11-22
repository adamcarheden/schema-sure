import * as DataTrue from '../DataTrue'

module.exports = DataTrue.getExports({
	reqPosInt: {
		validate: DataTrue.validators.positiveInteger,
		subscribe: ['greater']
	},
	optNonNegInt: {
		default: 0,
		validate: DataTrue.validators.nonNegativeInteger,
		subscribe: ['greater']
	},
},{
	greater: function() { 
		if (this.reqPosInt <= this.optNonNegInt) {
			throw new Error('reqPosInt should be greater than optNonNegInt'); 
		}
	}
},{})
	


