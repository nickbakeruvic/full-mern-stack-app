const mongoose = require('mongoose')

const Journal = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		date: { type: Date, default: Date.now, required: true },
		last_edited: { type: Date, default: Date.now, required: true },
	},
	{ collection: 'journal-data' }
)

const model = mongoose.model('Journal', Journal)

module.exports = model
