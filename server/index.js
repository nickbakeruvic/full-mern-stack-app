const app = require('./app.js')

console.log(app);

app.listen(1337, () => {
	console.log('Server started on 1337')
})
