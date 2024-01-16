import React, { useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import { useHistory } from 'react-router-dom'
import '../Dashboard.css'
import delete_icon from './resources/delete_icon.png'
import back_icon from './resources/back_arrow_icon.png'
import save_icon from './resources/save_icon.png'
import calendar_icon from './resources/calendar_icon.png'

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
						key={ journal._id }
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

	const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const dateCreated = new Date(journal.date)
	const day = dateCreated.getDay()
	const dayNum = dateCreated.getDate()
	const monthNum = dateCreated.getMonth()

	let contentPreview = journal.content
	if (journal.content.length > 70) {
		contentPreview = contentPreview.slice(0, 70) + "..."
	}


	return (
		<>
			{editingJournal &&
				<Journal_Editor
					journal={ journal }
					exit_callback={ () => setEditingJournal(false) }
					populate_callback={ populate_callback }
				/>}
			<div className="preview-wrapper">
				<div className='preview-date-wrapper' id="editor-column">
					<img src={ calendar_icon } className="icon" alt="Calendar icon"></img>
					<span className="button-text"> { weekdays[day] + ", " + months[monthNum]+  " " + dayNum } </span>
				</div>
				<div className='preview-title-wrapper' id="editor-column">
					<span> { journal.title } </span>
				</div>
				<div className='preview-content-wrapper' id="editor-column">
					<span> { contentPreview } </span>
				</div>
				<button
					onClick={(e) => setEditingJournal(true)}>
						Edit
				</button>
			</div>
		</>
	);
}

function Journal_Editor({journal, exit_callback, populate_callback}) {
	const [newTitle, setNewTitle] = useState(journal.title)
	const [newContent, setNewContent] = useState(journal.content)
	const deleteIconMessage = journal.new_journal ? 'Discard' : 'Delete'

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
			console.log(data.error)
		}
	}

	return (
		<div className="journal-wrapper">
			<div className="journal-title-wrapper">
				<input
					className="journal-title"
					type="text"
					placeholder="Title"
					value={newTitle}
					onChange={(e) => setNewTitle(e.target.value)}
				/>
			</div>
			<hr></hr>
			<div className="journal-interactions-wrapper">
				<div className="journal-content-wrapper">
					<textarea
						className="journal-content"
						placeholder="Type your content here..."
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
					/>
					<div className="spacer">
						<div className="save-button-wrapper" onClick={(e) => {updateJournal(null); populate_callback(); exit_callback()} }>
							<img src={ save_icon } className="save-icon" alt="Save journal icon" ></img>
							<span className="button-text">Save & Exit</span>
						</div>
					</div>

				</div>
			</div>
			<div className="delete-button-wrapper" id="button-wrapper" onClick={(e) => {deleteJournal(); populate_callback(); exit_callback()}}>
				<img src={ delete_icon } className="icon" alt="Delete journal icon"></img>
				<span className="button-text">{ deleteIconMessage }</span>
			</div>
			<div className="back-button-wrapper" id="button-wrapper" onClick={(e) => exit_callback()}>
				<img src={ back_icon } className="icon" alt="Back arrow icon"></img>
				<span className="button-text">Back</span>
			</div>
		</div>
	);
}

export default Dashboard
