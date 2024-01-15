import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import '../Dashboard.css'

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
			</form>
			{journals.map(journal => (
				<Journal_Item { ...journal } />
			))}
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
	const [newTitle, setNewTitle] = useState(journal.title)
	const [newContent, setNewContent] = useState(journal.content)

	async function updateJournal(event) {
		event.preventDefault()

		if (journal.title === newTitle && journal.content === newContent)
			return

		const req = await fetch('/api/journals', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				quote: "temp quote",
				title: newTitle,
				content: newContent,
			}),
		})

		const data = await req.json()
		if (data.status === 'ok') {
			console.log("success")
		} else {
			alert(data.error)
		}
	}

	return (
		<div className="journal-wrapper">
			<form onSubmit={updateJournal}>
				<div>
					<input
						type="text"
						placeholder="Title"
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
					/>
				</div>
				<div>
					<input
						type="text"
						placeholder="Type your content here..."
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
					/>
				</div>
				<input type="submit" value="Save" />
			</form>
		</div>
	);
}

export default Dashboard
