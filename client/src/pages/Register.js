import { useState } from 'react'
import '../Login.css'

function App() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	async function registerUser(event) {
		event.preventDefault()

		const response = await fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				email,
				password,
			}),
		})

		const data = await response.json()

		if (data.status === 'ok') {
			window.location.href = "/"
		} else {
			alert(data.error)
		}
	}

	return (
		<div class="container" onclick="onclick">
			<div class="top"></div>
			<div class="bottom"></div>
			<div class="center">
				<h2>Register</h2>
				<form onSubmit= {registerUser }>
					<input
						className={ "login-input" }
						value={ name }
						onChange={ (e) => setName(e.target.value) }
						type="text"
						placeholder="Name"
					/>
					<input
						className={ "login-input" }
						value={ email }
						onChange={ (e) => setEmail(e.target.value) }
						type="email"
						placeholder="Email"
					/>
					<input
						className={ "login-input" }
						value={ password }
						onChange={ (e) => setPassword(e.target.value) }
						type="password"
						placeholder="Password"
					/>
					<input type="submit" value="Register" />
				</form>
				<br></br>
				<br></br>
				<br></br>
			</div>
		</div>
	)
}

export default App
