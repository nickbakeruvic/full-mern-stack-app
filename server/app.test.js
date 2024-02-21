const request = require('supertest')
const makeApp = require('../server/app.js')

/*
 * Mock database functions
 */
const createUser = jest.fn()
const loginUser = jest.fn()
const createUserJournal = jest.fn()
const readUserJournals = jest.fn()
const updateUserJournal = jest.fn()
const deleteUserJournal = jest.fn()

/*
 * Initialize app with mock database functions
 */
const app = makeApp({
    createUser,
    loginUser,
    createUserJournal,
    readUserJournals,
    updateUserJournal,
    deleteUserJournal
})

describe("POST /api/register", () => {

    beforeEach(() => {
        createUser.mockReset()
    })

    describe("Given a valid username and password", () => {
        test("Should respond with status 200 OK", async() => {
            createUser.mockResolvedValue({ error: '' })
            const response = await request(app).post("/api/register").send({
                username: "username",
                password: "password"
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.status).toBe('ok')
        })

        test("Should save the given username and password to the database", async() => {

            const bodyData = [
                { username: "username1", password: "password1" },
                { username: "username2", password: "password2" },
                { username: "username3", password: "password3" }
            ]

            for (let i = 0; i < bodyData.length; i ++) {
                createUser.mockReset()
                createUser.mockResolvedValue({ error: '' })

                await request(app).post("/api/register").send(bodyData[i])

                expect(createUser.mock.calls.length).toBe(1)
                expect(createUser.mock.calls[0][0]).toBe(bodyData[i]['username'])
                expect(createUser.mock.calls[0][1]).toBe(bodyData[i]['password'])
            }

        })
    })

    test("Invalid request should respond with status 400", async() => {
        createUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/register").send({
            username: "username",
        })
        expect(response.statusCode).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.error).toBe('username and password fields must be present')
        expect(createUser.mock.calls.length).toBe(0)
    })

    test("Valid request where database fails should respond with status 400", async() => {
        createUser.mockResolvedValue({ error: 'Duplicate username' })
        const response = await request(app).post("/api/register").send({
            username: "username",
            password: "password"
        })
        expect(response.statusCode).toBe(400)
        expect(response.body.status).toBe('error')
        expect(response.body.error).toBe('Duplicate username')
        expect(createUser.mock.calls.length).toBe(1)
    })
})

