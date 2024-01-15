import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'

const Dashboard = () => {
	const history = useHistory()
	const [quote, setQuote] = useState('')
	const [tempQuote, setTempQuote] = useState('')
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [journals, setJournals] = useState([])

	async function populateJournals() {
		const req = await fetch('/api/journals', {
			headers: {
				'x-access-token': localStorage.getItem('token'),
			},
		})

		const data = await req.json()
		if (data.status === 'ok') {
			setQuote(data.quote)
			setJournals(data.journals_list.journals)
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
				populateJournals()
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

				{journals.map(journal => (
					<Journal_Item { ...journal } />
				))}

			</form>
		</div>
	)
}

function Journal_Item(journal) {
	const [editing, setEditing] = useState(false)

	return (
		<>
			{editing && <Edit_Journal { ...journal } />}
			<div>
				<h1> { journal.title } - { journal.content } <button onClick={(e) => setEditing(true)}>Edit</button> </h1>
			</div>
		</>
	);
}

function Edit_Journal(journal) {

	const journal_style = {
		border: 'thin solid red',
		position: 'absolute',
		top: '0px',
		height: '100%',
		width: '100%',
		backgroundColor: 'white',
	}

	return (
		<div style={journal_style}>
			<div>
				<h1> {journal.title} </h1>
			</div>
			<div>
				<p> {journal.content} </p>
			</div>
		</div>
	);
}

export default Dashboard
