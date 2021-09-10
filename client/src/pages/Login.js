import { useState } from 'react'
import '../Login.css'

function App() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	async function loginUser(event) {
		event.preventDefault()

		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
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
				<form onSubmit={loginUser}>
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						placeholder="Email"
					/>
					<input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						placeholder="Password"
					/>
					<input type="submit" value="Login" />
					<input
						value="Register"
						type="button"
						onClick={(e) => window.location.href = '/register'}
					/>
				</form>
				<h2>&nbsp;</h2>
			</div>
		</div>

	)
}

export default App
