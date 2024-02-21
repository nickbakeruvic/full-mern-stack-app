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

        console.log(req.body.username + " - " + req.body.password)
        if (!req.body.username || !req.body.password) {
            res.status(400)
            return res.json({ status: 'error', error: 'username and password fields must be present' })
        }

        const databaseResponse = await database.createUser(req.body.username, req.body.password)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok' })
        }
    })

    app.post('/api/login', async (req, res) => {

        const databaseResponse = await database.loginUser(req.body.username, req.body.password)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            const token = jwt.sign(
                {
                    username: req.body.username,
                },
                'secret123'
            )
            res.json({ status: 'ok', user: token })
        }
    })

    app.get('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let username = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            username = decoded.username
            if (!username) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.readUserJournals(username)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok', journals_list: databaseResponse.journals_list})
        }
    })

    app.post('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let username = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            username = decoded.username
            if (!username) return res.json({ status: 'error', error: 'Invalid token' })
        } catch {
            return res.json({ status: 'error', error: 'Invalid token' })
        }

        const databaseResponse = await database.createUserJournal(username, req.body.title, req.body.content)

        if (databaseResponse.error) {
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.json({ status: 'ok' })
        }

    })

    app.put('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        let username = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            username = decoded.username
            if (!username) return res.json({ status: 'error', error: 'Invalid token' })
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
        let username = undefined

        try {
            const decoded = jwt.verify(token, 'secret123')
            username = decoded.username
            if (!username) return res.json({ status: 'error', error: 'Invalid token' })
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