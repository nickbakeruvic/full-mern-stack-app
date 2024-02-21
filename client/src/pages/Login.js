import { useState } from 'react'
import './styles/Login.css'

function App() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	async function loginUser(event) {
		event.preventDefault()

		const response = await fetch('/api/login', {
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

		if (data.user) {
			localStorage.setItem('token', data.user)
			window.location.href = '/dashboard'
		} else {
			alert('Please check your username and password')
		}
	}

	return (
		<div class="container" onclick="onclick">
			<div class="top"></div>
			<div class="bottom"></div>
			<div class="center">
				<h2>Please Sign In</h2>
				<form onSubmit={ loginUser }>
					<input
						className={ "login-input"}
						value={ username }
						onChange={ (e) => setUsername(e.target.value) }
						type="text"
						placeholder="Name"
					/>
					<input
						className={ "login-input"}
						value={ password }
						onChange={ (e) => setPassword(e.target.value) }
						type="password"
						placeholder="Password"
					/>
					<input type="submit" value="Login" />
					<input
						value="Register"
						type="button"
						onClick={ (e) => window.location.href = '/register' }
					/>
				</form>
				<br></br>
				<br></br>
				<br></br>
			</div>
		</div>
	)
}

export default App
