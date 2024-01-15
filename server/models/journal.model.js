const mongoose = require('mongoose')

const Journal = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		date: { type: String, required: true },
		last_edited: { type: String, required: true },
	},
	{ collection: 'journal-data' }
)

const model = mongoose.model('Journal', Journal)

module.exports = model
