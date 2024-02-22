const path = require('path')
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

var dotenv = require('dotenv')
dotenv.config()

const makeApp = function (database) {

    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use(express.static('static'))

    app.post('/api/register', async (req, res) => {
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
        if (!req.body.username || !req.body.password) {
            res.status(400)
            return res.json({ status: 'error', error: 'username and password fields must be present' })
        }

        const databaseResponse = await database.loginUser(req.body.username, req.body.password)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok', access_token: createToken(req.body.username) })
        }
    })

    app.get('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        const username = decodeToken(token)

        if (!username) {
            res.status(401)
            return res.json({ status: 'unauthorized', error: 'Invalid token' })
        }

        const databaseResponse = await database.readUserJournals(username)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok', journals_list: databaseResponse.journals_list})
        }
    })

    app.post('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        const username = decodeToken(token)

        if (!username) {
            res.status(401)
            return res.json({ status: 'unauthorized', error: 'Invalid token' })
        }

        if (!req.body.title || !req.body.content) {
            res.status(400)
            return res.json({ status: 'error', error: 'title and content fields must be present' })
        }

        const databaseResponse = await database.createUserJournal(username, req.body.title, req.body.content)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok' })
        }

    })

    app.put('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        const username = decodeToken(token)

        if (!username) {
            res.status(401)
            return res.json({ status: 'unauthorized', error: 'Invalid token' })
        }

        if (!req.body.id || !req.body.title || !req.body.content) {
            res.status(400)
            return res.json({ status: 'error', error: 'id, title, and content fields must be present' })
        }

        const databaseResponse = await database.updateUserJournal(req.body.id, req.body.title, req.body.content)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok' })
        }
    })

    app.delete('/api/journals', async (req, res) => {
        const token = req.headers['x-access-token']
        const username = decodeToken(token)

        if (!username) {
            res.status(401)
            return res.json({ status: 'unauthorized', error: 'Invalid token' })
        }

        if (!req.body.id) {
            res.status(400)
            return res.json({ status: 'error', error: 'id field must be present' })
        }

        const databaseResponse = await database.deleteUserJournal(req.body.id)

        if (databaseResponse.error) {
            res.status(400)
            res.json({ status: 'error', error: databaseResponse.error })
        } else {
            res.status(200)
            res.json({ status: 'ok' })
        }
    })

    app.get('*', (req, res) => {
        // send the index.html from build folder
        res.sendFile(path.join(__dirname, 'static/index.html'))
    })

    const decodeToken = (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            username = decoded.username
            if (!username) return undefined
        } catch {
            return undefined
        }
        return username
    }

    const createToken = (username) => {
        const token = jwt.sign(
            {
                username: username,
            },
            process.env.JWT_SECRET
        )
        return token
    }

    return app
}

module.exports = makeApp