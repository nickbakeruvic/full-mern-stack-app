const path = require('path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const makeApp = function (database) {

    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(express.static('static'))

    app.post('/api/register', async (req, res) => {
        console.log(req.body)
        const databaseResponse = await database.createUser(req.body.name, req.body.email, req.body.password)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok' })
        }
    })

    app.post('/api/login', async (req, res) => {

        const databaseResponse = await database.loginUser(req.body.email, req.body.password)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            const token = jwt.sign(
                {
                    name: databaseResponse.name,
                    email: req.body.email,
                },
                'secret123'
            )
            res.json({ status: 'ok', user: token })
        }
    })

    app.get('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let email = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            email = decoded.email
            if (!email) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.getUserJournals(email)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok', journals_list: databaseResponse.journals_list})
        }
    })

    app.post('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let email = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            email = decoded.email
            if (!email) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.createUserJournal(email, req.body.title, req.body.content)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok' })
        }

    })

    app.put('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let email = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            email = decoded.email
            if (!email) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.updateUserJournal(req.body.id, req.body.title, req.body.content)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok' })
        }
    })

    app.delete('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let email = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            email = decoded.email
            if (!email) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.deleteUserJournal(req.body.id)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok' })
        }
    })

    app.get('*', (req, res) => {
        // send the index.html from build folder
        res.sendFile(path.join(__dirname, 'static/index.html'))
    })

    return app
}

module.exports = makeApp