const request = require('supertest')
const makeApp = require('../server/app.js')

/*
 * Mock database functions
 */
const createUser = jest.fn()
const loginUser = jest.fn()
const getUserJournals = jest.fn()
const createUserJournal = jest.fn()
const updateUserJournal = jest.fn()
const deleteUserJournal = jest.fn()

/*
 * Initialize app with mock database functions
 */
const app = makeApp({
    createUser,
    loginUser,
    getUserJournals,
    createUserJournal,
    updateUserJournal,
    deleteUserJournal
})

describe("POST /api/register", () => {

    test("Valid request should response with status 200", async() => {
        createUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/register").send({
            username: "username",
            password: "password"
        })
        expect(response.statusCode).toBe(200)
    })

})
