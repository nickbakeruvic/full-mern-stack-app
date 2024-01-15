import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import '../Dashboard.css'

const Dashboard = () => {
	const history = useHistory()
	const [journals, setJournals] = useState([])
	const [addingJournal, setAddingJournal] = useState(false)

	async function populateJournals() {
		const req = await fetch('/api/journals', {
			headers: {
				'x-access-token': localStorage.getItem('token'),
			},
		})

		const data = await req.json()
		if (data.status === 'ok') {
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

	return (
		<>
			{addingJournal &&
			<Journal_Editor
				journal={ {title: '', content: '', _id: '', new_journal: true } }
				exit_callback={ () => setAddingJournal(false) }
				populate_callback={ populateJournals }
			/>}
			<button
				onClick={(e) => setAddingJournal(true)}>
					Add Journal
			</button>
			<div>
				{journals.map(journal => (
					<Journal_Item
						journal={ journal }
						populate_callback={ populateJournals }
					/>
				))}
			</div>
		</>
	)
}

function Journal_Item({journal, populate_callback}) {
	const [editingJournal, setEditingJournal] = useState(false)

	return (
		<>
			{editingJournal &&
				<Journal_Editor
					journal={ journal }
					exit_callback={ () => setEditingJournal(false) }
					populate_callback={ populate_callback }
				/>}
			<div>
				<h1> { journal.title } - { journal.content }
					<button
						onClick={(e) => setEditingJournal(true)}>
							Edit
					</button>
				</h1>
			</div>
		</>
	);
}

function Journal_Editor({journal, exit_callback, populate_callback}) {
	const [newTitle, setNewTitle] = useState(journal.title)
	const [newContent, setNewContent] = useState(journal.content)

	async function updateJournal(event) {
		let http_method = 'PUT'

		if (event !== null)
			event.preventDefault()

		if (journal.title === newTitle && journal.content === newContent)
			return

		if (journal.new_journal)
			http_method = 'POST'

		const req = await fetch('/api/journals', {
			method: http_method,
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				id: journal._id,
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

	async function deleteJournal() {
		const req = await fetch('/api/journals', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'x-access-token': localStorage.getItem('token'),
			},
			body: JSON.stringify({
				id: journal._id,
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
			{ journal.new_journal !== true && <button onClick={(e) => deleteJournal() }> Delete </button> }
			<button onClick={(e) => {updateJournal(null); populate_callback(); exit_callback()} }> Save & Exit </button>
		</div>
	);
}

export default Dashboard
