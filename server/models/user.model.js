const mongoose = require('mongoose')

const User = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		quote: { type: String },
		//messages: { type: String },
		journal: { type: mongoose.Schema.Types.ObjectId, ref: "Journal" },
		// messages: [{ type: String }],
	},
	{ collection: 'user-data' }
)

const model = mongoose.model('UserData', User)

module.exports = model
