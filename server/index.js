const makeApp = require('./app.js')
const database = require('./database.js')

const app = makeApp(database)

app.listen(1337, () => {
	console.log('Server started on 1337')
})
