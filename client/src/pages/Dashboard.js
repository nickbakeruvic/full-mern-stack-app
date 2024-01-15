import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'

const Dashboard = () => {
	const history = useHistory()
	const [quote, setQuote] = useState('')
	const [tempQuote, setTempQuote] = useState('')
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')

	async function populateQuote() {
		const req = await fetch('/api/journals', {
			headers: {
				'x-access-token': localStorage.getItem('token'),
			},
		})

		const data = await req.json()
		if (data.status === 'ok') {
			setQuote(data.quote)

			data.journals_list.journals.forEach((element) => console.log("journal entry: " + element.title + "|" + element.content + "|" + new Date(element.date) + "|" + new Date(element.last_edited)));
		} else {
			alert(data.error)
		}
	}

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			const user = jwt.decode(token)
			if (!user) {
				localStorage.removeItem('token')
				history.replace('/login')
			} else {
				populateQuote()
			}
		} else {
			history.replace('/login')
		}
	}, [])

	async function updateQuote(event) {
		event.preventDefault()

		const req = await fetch('/api/journals', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				quote: tempQuote,
				title: title,
				content: content,
			}),
		})

		const data = await req.json()
		if (data.status === 'ok') {
			setQuote(tempQuote)
			setTempQuote('')
		} else {
			alert(data.error)
		}
	}

	return (
		<div>
			<h1>Your quote: {quote || 'No quote found'}</h1>
			<form onSubmit={updateQuote}>
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<br/>
				<input
					type="text"
					placeholder="Content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
				<br/>
				<input
					type="text"
					placeholder="Quote"
					value={tempQuote}
					onChange={(e) => setTempQuote(e.target.value)}
				/>
				<input type="submit" value="Update quote" />
			</form>
		</div>
	)
}

export default Dashboard
