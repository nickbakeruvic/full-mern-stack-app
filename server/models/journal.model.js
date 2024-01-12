const mongoose = require('mongoose')

const Journal = new mongoose.Schema(
	{
		messages: { type: String },
	},
	{ collection: 'journal-data' }
)

const model = mongoose.model('Journal', Journal)

module.exports = model
