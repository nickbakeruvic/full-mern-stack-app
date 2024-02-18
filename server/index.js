const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const Journal = require('./models/journal.model')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
var dotenv = require('dotenv')

app.use(cors())
app.use(express.json())
app.use(express.static('static'))

dotenv.config()
var mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri)

app.post('/api/register', async (req, res) => {
	console.log(req.body)
	try {
		const newPassword = await bcrypt.hash(req.body.password, 10)
		await User.create({
			name: req.body.name,
			email: req.body.email,
			password: newPassword,
		})
		res.json({ status: 'ok' })
	} catch (err) {
		res.json({ status: 'error', error: 'Duplicate email' })
	}
})

app.post('/api/login', async (req, res) => {
	const user = await User.findOne({
		email: req.body.email,
	})

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid login' })
	}

	const isPasswordValid = await bcrypt.compare(
		req.body.password,
		user.password
	)

	if (isPasswordValid) {
		const token = jwt.sign(
			{
				name: user.name,
				email: user.email,
			},
			'secret123'
		)

		return res.json({ status: 'ok', user: token })
	} else {
		return res.json({ status: 'error', user: false })
	}
})

app.get('/api/journals', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email
		const user = await User.findOne({ email: email })
		const journals = await User.findById(user._id).populate({ path: "journals", });

		return res.json({ status: 'ok', journals_list: journals})
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.post('/api/journals', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')
		const email = decoded.email

		new_journal_entry = await Journal.create({
			title: req.body.title,
			content: req.body.content,
		})

		await User.updateOne(
			{ email: email },
			{ $push: { journals: new_journal_entry} }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		// TODO: better error messages i.e. mongoose validation fails
		res.json({ status: 'error', error: 'invalid token' })
	}
})

// TODO: may need to check user in order to validate auth
app.put('/api/journals', async (req, res) => {
	const token = req.headers['x-access-token']

	try {
		const decoded = jwt.verify(token, 'secret123')

		await Journal.updateOne(
			{ _id: req.body.id },
			{ $set: { title: req.body.title, content: req.body.content, last_edited: Date.now() } }
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		// TODO: better error messages i.e. mongoose validation fails
		res.json({ status: 'error', error: 'invalid token' })
	}
})

// TODO: may need to check user in order to validate auth
app.delete('/api/journals', async (req, res) => {
	const token = req.headers['x-access-token']

	console.log("delete")

	try {
		const decoded = jwt.verify(token, 'secret123')

		await Journal.deleteOne(
			{ _id: req.body.id },
		)

		return res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		// TODO: better error messages i.e. mongoose validation fails
		res.json({ status: 'error', error: 'invalid token' })
	}
})

app.get('*', (req, res) => {
	// send the index.html from build folder
	res.sendFile(path.join(__dirname, 'static/index.html'))
})

app.listen(1337, () => {
	console.log('Server started on 1337')
})
