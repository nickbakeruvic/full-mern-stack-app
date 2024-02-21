import { useState } from 'react'
import './styles/Login.css'

function App() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [confirmedPassword, setConfirmedPassword] = useState('')

	async function registerUser(event) {
		event.preventDefault()

		if (password !== confirmedPassword) {
			alert("Passwords do not match!")
			return
		}

		const response = await fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username,
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
						value={ username }
						onChange={ (e) => setUsername(e.target.value) }
						type="text"
						placeholder="Name"
					/>
					<input
						className={ "login-input" }
						value={ password }
						onChange={ (e) => setPassword(e.target.value) }
						type="password"
						placeholder="Password"
					/>
					<input
						className={ "login-input" }
						value={ confirmedPassword }
						onChange={ (e) => setConfirmedPassword(e.target.value) }
						type="password"
						placeholder="Confirm Password"
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
