const mongoose = require('mongoose')

const User = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		journals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Journal" }],
	},
	{ collection: 'UserData' }
)

const model = mongoose.model('UserData', User)

module.exports = model
