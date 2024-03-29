const mongoose = require('mongoose')
const User = require('./models/user.model')
const Journal = require('./models/journal.model')
const bcrypt = require('bcryptjs')

var dotenv = require('dotenv')
dotenv.config()

var mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri)

const createUser = async (username, password) => {
    try {
		const newPassword = await bcrypt.hash(password, 10)
        await User.create({
            username: username,
            password: newPassword,
        })
        return { error: '' }
	} catch (err) {
		return { error: 'Duplicate username' }
	}
}

const loginUser = async (username, password) => {
	const user_record = await User.findOne({
		username: username,
	})

	if (!user_record) return { error: 'Invalid login' }

	const isPasswordValid = await bcrypt.compare(
		password,
		user_record.password
	)

    if (!isPasswordValid) return { error: 'Invalid login' }

	return { error: '' }
}

const readUserJournals = async (username) => {
    const user_record = await User.findOne({
        username: username
    })

    if (!user_record) return { error: 'Unable to find user' }

    const journals = await User.findById(user_record._id).populate({
        path: "journals"
    });

    return { journals_list: journals}
}

const createUserJournal = async (username, title, content) => {
    if (!title || !content) return { error: 'Title / content fields cannot be empty' }

    try {
        const new_journal_entry = await Journal.create({
            title: title,
            content: content,
        })

        await User.updateOne(
            {
                username: username
            },
            {
                $push: {
                    journals: new_journal_entry
                }
            }
        )

        return { error: '' }
    } catch {
        return { error: 'Could not create journal'}
    }
}

const updateUserJournal = async (journal_id, new_title, new_content) => {
    if (!new_title || !new_content) return { error: 'Title / content fields cannot be empty' }

    await Journal.updateOne(
        {
            _id: journal_id
        },
        {
            $set: {
                title: new_title,
                content: new_content,
                last_edited: Date.now()
            }
        }
    )

    return { error: '' }
}

const deleteUserJournal = async (journal_id) => {
	try {
        await Journal.deleteOne({
            _id: journal_id
        })
    } catch {
        return { error: 'Could not delete journal' }
    }

    return { error: '' }
}

module.exports = { createUser, loginUser, readUserJournals, createUserJournal, updateUserJournal, deleteUserJournal }