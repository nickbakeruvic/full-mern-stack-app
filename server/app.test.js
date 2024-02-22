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
        describe("Given a valid database response", () => {
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

                for (let i = 0; i < bodyData.length; i++) {
                    createUser.mockReset()
                    createUser.mockResolvedValue({ error: '' })

                    await request(app).post("/api/register").send(bodyData[i])

                    expect(createUser.mock.calls.length).toBe(1)
                    expect(createUser.mock.calls[0][0]).toBe(bodyData[i]['username'])
                    expect(createUser.mock.calls[0][1]).toBe(bodyData[i]['password'])
                }

            })
        })

        describe("Given an invalid database response", () => {
            test("Should respond with status 400 Error", async() => {
                createUser.mockResolvedValue({ error: 'Duplicate username' })
                const response = await request(app).post("/api/register").send({
                    username: "username",
                    password: "password"
                })
                expect(response.statusCode).toBe(400)
                expect(response.body.status).toBe('error')
            })
        })
    })

    describe("Given invalid JSON", () => {
        test("Should respond with status 400 Error", async() => {
            const bodyData = [
                { username: "username"},
                { password: "password" },
                { username: "username", notpassword: "password" },
                {}
            ]

            for (let i = 0; i < bodyData.length; i++) {
                createUser.mockReset()
                createUser.mockResolvedValue({ error: '' })

                const response = await request(app).post("/api/register").send(bodyData[i])

                expect(response.statusCode).toBe(400)
                expect(response.body.status).toBe('error')
                expect(response.body.error).toBe('username and password fields must be present')
            }
        })

        test("Should not attempt to create a user in the database", async() => {
            const bodyData = [
                { username: "username"},
                { password: "password" },
                { username: "username", notpassword: "password" },
                {}
            ]

            for (let i = 0; i < bodyData.length; i++) {
                createUser.mockReset()
                createUser.mockResolvedValue({ error: '' })

                await request(app).post("/api/register").send(bodyData[i])

                expect(createUser.mock.calls.length).toBe(0)
            }
        })
    })
})


describe("POST /api/login", () => {
    beforeEach(() => {
        loginUser.mockReset()
    })

    describe("Given a valid username and password", () => {
        describe("Given a valid database response", () => {
            test("Should respond with status 200 OK", async() => {
                loginUser.mockResolvedValue({ error: '' })

                const response = await request(app).post("/api/login").send({
                    username: "username",
                    password: "password"
                })

                expect(response.statusCode).toBe(200)
                expect(response.body.status).toBe('ok')
            })

            test("Should ask database to verify the user's login", async() => {
                loginUser.mockResolvedValue({ error: '' })

                const bodyData = [
                    { username: "username1", password: "password1" },
                    { username: "username2", password: "password2" },
                    { username: "username3", password: "password3" }
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    loginUser.mockReset()
                    loginUser.mockResolvedValue({ error: '' })

                    await request(app).post("/api/login").send(bodyData[i])

                    expect(loginUser.mock.calls.length).toBe(1)
                    expect(loginUser.mock.calls[0][0]).toBe(bodyData[i]['username'])
                    expect(loginUser.mock.calls[0][1]).toBe(bodyData[i]['password'])
                }
            })

            test("Should return a token", async() => {
                loginUser.mockResolvedValue({ error: '' })

                const response = await request(app).post("/api/login").send({
                    username: "username",
                    password: "password"
                })

                expect(response.body.access_token).toBeDefined()
            })
        })
        describe("Given an invalid database response", () => {
            test("Should respond with status 400 Error", async() => {
                loginUser.mockResolvedValue({ error: 'Invalid login' })
                const response = await request(app).post("/api/login").send({
                    username: "username",
                    password: "password"
                })
                expect(response.statusCode).toBe(400)
                expect(response.body.status).toBe('error')
            })
        })
    })

    describe("Given invalid JSON", () => {
        test("Should respond with status 400 Error", async() => {
            const bodyData = [
                { username: "username"},
                { password: "password" },
                { username: "username", notpassword: "notpassword" },
                {}
            ]

            for (let i = 0; i < bodyData.length; i++) {
                loginUser.mockReset()
                loginUser.mockResolvedValue({ error: '' })

                const response = await request(app).post("/api/login").send(bodyData[i])

                expect(response.statusCode).toBe(400)
                expect(response.body.status).toBe('error')
                expect(response.body.error).toBe('username and password fields must be present')
            }
        })

        test("Should not attempt to verify the user's login data", async() => {
            const bodyData = [
                { username: "username"},
                { password: "password" },
                { username: "username", notpassword: "notpassword" },
                {}
            ]

            for (let i = 0; i < bodyData.length; i++) {
                loginUser.mockReset()
                loginUser.mockResolvedValue({ error: '' })

                await request(app).post("/api/login").send(bodyData[i])

                expect(loginUser.mock.calls.length).toBe(0)
            }
        })
    })
})

describe("GET /api/journals", () => {
    let token

    beforeEach(async () => {
        readUserJournals.mockReset()

        // Store valid access token to use in request headers
        loginUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/login").send({
            username: "username",
            password: "password"
        })

        token = response.body.access_token
    })

    describe("Given valid access token", () => {
        describe("Given valid database response", () => {
            test("Should respond with status 200 OK", async () => {
                readUserJournals.mockResolvedValue({ error: '', journals_list: '' })
                const response = await request(app).get("/api/journals").set('x-access-token', token).send()
                expect(response.statusCode).toBe(200)
                expect(response.body.status).toBe('ok')
            })

            test("Should ask database for user's journals", async () => {
                readUserJournals.mockResolvedValue({ error: '', journals_list: '' })
                await request(app).get("/api/journals").set('x-access-token', token).send()
                expect(readUserJournals.mock.calls.length).toBe(1)
                expect(readUserJournals.mock.calls[0][0]).toBe('username')
            })

            test("Should respond with the user's journals", async () => {
                readUserJournals.mockResolvedValue({ error: '', journals_list: 'dummy journal' })
                const response = await request(app).get("/api/journals").set('x-access-token', token).send()
                expect(response.statusCode).toBe(200)
                expect(response.body.journals_list).toBe('dummy journal')
            })
        })

        describe("Given invalid database response", () => {
            test("Should respond with status 400 Error", async() => {
                readUserJournals.mockResolvedValue({ error: 'Invalid login' })
                const response = await request(app).get("/api/journals").set('x-access-token', token).send()
                expect(response.statusCode).toBe(400)
                expect(response.body.status).toBe('error')
            })
        })
    })

    describe("Given an invalid access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).get("/api/journals").set('x-access-token', 'dummy').send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })

    describe("Given no access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).get("/api/journals").send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })
})

describe("POST /api/journals", () => {
    let token

    beforeEach(async () => {
        createUserJournal.mockReset()

        // Store valid access token to use in request headers
        loginUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/login").send({
            username: "username",
            password: "password"
        })

        token = response.body.access_token
    })

    describe("Given valid access token", () => {
        describe("Given valid JSON", () => {
            describe("Given valid database response", () => {
                test("Should respond with status 200 OK", async () => {
                    createUserJournal.mockResolvedValue({ error: '' })
                    const response = await request(app).post("/api/journals").set('x-access-token', token).send({
                        title: "title",
                        content: "content"
                    })
                    expect(response.statusCode).toBe(200)
                    expect(response.body.status).toBe('ok')
                })

                test("Should ask database to create new journal", async () => {
                    const bodyData = [
                        { title: "title1", content: "content1" },
                        { title: "title2", content: "content2" },
                        { title: "title3", content: "content3" }
                    ]

                for (let i = 0; i < bodyData.length; i++) {
                        createUserJournal.mockReset()
                        createUserJournal.mockResolvedValue({ error: '' })

                        await request(app).post("/api/journals").set('x-access-token', token).send(bodyData[i])

                        expect(createUserJournal.mock.calls.length).toBe(1)
                        expect(createUserJournal.mock.calls[0][0]).toBe('username')
                        expect(createUserJournal.mock.calls[0][1]).toBe(bodyData[i]['title'])
                        expect(createUserJournal.mock.calls[0][2]).toBe(bodyData[i]['content'])
                    }
                })
            })

            describe("Given invalid database response", () => {
                test("Should respond with status 400 Error", async() => {
                    createUserJournal.mockResolvedValue({ error: 'Could not find user' })
                    const response = await request(app).post("/api/journals").set('x-access-token', token).send({
                        title: "title",
                        content: "content"
                    })
                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                })
            })
        })

        describe("Given invalid JSON", () => {
            test("Should respond with status 400 Error", async() => {
                const bodyData = [
                    { title: "title"},
                    { content: "content" },
                    { title: "title", notcontent: "notcontent" },
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    createUserJournal.mockReset()
                    createUserJournal.mockResolvedValue({ error: '' })

                    const response = await request(app).post("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                    expect(response.body.error).toBe('title and content fields must be present')
                }
            })

            test("Should not attempt to create the journal", async() => {
                const bodyData = [
                    { title: "title"},
                    { content: "content" },
                    { title: "title", notcontent: "notcontent" },
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    createUserJournal.mockReset()
                    createUserJournal.mockResolvedValue({ error: '' })

                    await request(app).post("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(createUserJournal.mock.calls.length).toBe(0)
                }
            })
        })
    })

    describe("Given an invalid access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).post("/api/journals").set('x-access-token', 'dummy').send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })

    describe("Given no access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).post("/api/journals").send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })
})

describe("PUT /api/journals", () => {
    let token

    beforeEach(async () => {
        updateUserJournal.mockReset()

        // Store valid access token to use in request headers
        loginUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/login").send({
            username: "username",
            password: "password"
        })

        token = response.body.access_token
    })

    describe("Given valid access token", () => {
        describe("Given valid JSON", () => {
            describe("Given valid database response", () => {
                test("Should respond with status 200 OK", async () => {
                    updateUserJournal.mockResolvedValue({ error: '' })
                    const response = await request(app).put("/api/journals").set('x-access-token', token).send({
                        id: "id",
                        title: "title",
                        content: "content"
                    })
                    expect(response.statusCode).toBe(200)
                    expect(response.body.status).toBe('ok')
                })

                test("Should ask database to update journal", async () => {
                    updateUserJournal.mockResolvedValue({ error: '' })
                    const bodyData = [
                        { id: "id1", title: "title1", content: "content1" },
                        { id: "id2", title: "title2", content: "content2" },
                        { id: "id3", title: "title3", content: "content3" }
                    ]

                    for (let i = 0; i < bodyData.length; i++) {
                        updateUserJournal.mockReset()
                        updateUserJournal.mockResolvedValue({ error: '' })

                        await request(app).put("/api/journals").set('x-access-token', token).send(bodyData[i])

                        expect(updateUserJournal.mock.calls.length).toBe(1)
                        expect(updateUserJournal.mock.calls[0][0]).toBe(bodyData[i]['id'])
                        expect(updateUserJournal.mock.calls[0][1]).toBe(bodyData[i]['title'])
                        expect(updateUserJournal.mock.calls[0][2]).toBe(bodyData[i]['content'])
                    }
                })
            })

            describe("Given invalid database response", () => {
                test("Should respond with status 400 Error", async() => {
                    updateUserJournal.mockResolvedValue({ error: 'Could not find journal' })
                    const response = await request(app).put("/api/journals").set('x-access-token', token).send({
                        id: "id",
                        title: "title",
                        content: "content"
                    })
                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                })
            })
        })

        describe("Given invalid JSON", () => {
            test("Should respond with status 400 Error", async() => {
                const bodyData = [
                    { title: "title", content: "content"},
                    { id: "id", content: "content" },
                    { title: "title", notcontent: "notcontent", id: "id"},
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    updateUserJournal.mockReset()
                    updateUserJournal.mockResolvedValue({ error: '' })

                    const response = await request(app).put("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                    expect(response.body.error).toBe('id, title, and content fields must be present')
                }
            })

            test("Should not attempt to update a journal", async() => {
                const bodyData = [
                    { title: "title"},
                    { content: "content" },
                    { title: "title", notcontent: "notcontent" },
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    updateUserJournal.mockReset()
                    updateUserJournal.mockResolvedValue({ error: '' })

                    await request(app).put("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(updateUserJournal.mock.calls.length).toBe(0)
                }
            })
        })
    })

    describe("Given an invalid access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).put("/api/journals").set('x-access-token', 'dummy').send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })

    describe("Given no access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).put("/api/journals").send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })
})

describe("DELETE /api/journals", () => {
    let token

    beforeEach(async () => {
        deleteUserJournal.mockReset()

        // Store valid access token to use in request headers
        loginUser.mockResolvedValue({ error: '' })
        const response = await request(app).post("/api/login").send({
            username: "username",
            password: "password"
        })

        token = response.body.access_token
    })

    describe("Given valid access token", () => {
        describe("Given valid JSON", () => {
            describe("Given valid database response", () => {
                test("Should respond with status 200 OK", async () => {
                    deleteUserJournal.mockResolvedValue({ error: '' })
                    const response = await request(app).delete("/api/journals").set('x-access-token', token).send({ id: "id" })

                    expect(response.statusCode).toBe(200)
                    expect(response.body.status).toBe('ok')
                })

                test("Should ask database to delete journal", async () => {
                    deleteUserJournal.mockResolvedValue({ error: '' })
                    const bodyData = [
                        { id: "id1" },
                        { id: "id2" },
                        { id: "id3" }
                    ]

                for (let i = 0; i < bodyData.length; i++) {
                        deleteUserJournal.mockReset()
                        deleteUserJournal.mockResolvedValue({ error: '' })

                        await request(app).delete("/api/journals").set('x-access-token', token).send(bodyData[i])

                        expect(deleteUserJournal.mock.calls.length).toBe(1)
                        expect(deleteUserJournal.mock.calls[0][0]).toBe(bodyData[i]['id'])
                    }
                })
            })

            describe("Given invalid database response", () => {
                test("Should respond with status 400 Error", async() => {
                    deleteUserJournal.mockResolvedValue({ error: 'Could not find journal' })
                    const response = await request(app).delete("/api/journals").set('x-access-token', token).send({ id: "id" })

                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                })
            })
        })

        describe("Given invalid JSON", () => {
            test("Should respond with status 400 Error", async() => {
                const bodyData = [
                    { notid: "notid" },
                    { title: "title", content: "content"},
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    deleteUserJournal.mockReset()
                    deleteUserJournal.mockResolvedValue({ error: '' })

                    const response = await request(app).delete("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(response.statusCode).toBe(400)
                    expect(response.body.status).toBe('error')
                    expect(response.body.error).toBe('id field must be present')
                }
            })

            test("Should not attempt to delete a journal", async() => {
                const bodyData = [
                    { notid: "notid" },
                    { title: "title", content: "content"},
                    {}
                ]

                for (let i = 0; i < bodyData.length; i++) {
                    deleteUserJournal.mockReset()
                    deleteUserJournal.mockResolvedValue({ error: '' })

                    await request(app).delete("/api/journals").set('x-access-token', token).send(bodyData[i])

                    expect(deleteUserJournal.mock.calls.length).toBe(0)
                }
            })
        })
    })

    describe("Given an invalid access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).delete("/api/journals").set('x-access-token', 'dummy').send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })

    describe("Given no access token", () => {
        test("Should respond with status 401", async () => {
            const response = await request(app).delete("/api/journals").send({
                username: "username",
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.status).toBe('unauthorized')
        })
    })
})