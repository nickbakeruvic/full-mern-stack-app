import React, { createContext, useContext, useEffect, useState } from 'react'
import jwt from 'jsonwebtoken'
import delete_icon from './images/delete_icon.png'
import back_icon from './images/back_arrow_icon.png'
import save_icon from './images/save_icon.png'
import calendar_icon from './images/calendar_icon.png'
import edit_icon from './images/edit_icon.png'
import add_icon from './images/add_icon.png'
import logout_icon from './images/logout_icon.png'
import empty_journals_icon from './images/empty_journals_icon.png'
import './styles/Dashboard.css'

const CleanupEditorContext = createContext(null)

const Dashboard = () => {
	const [journals, setJournals] = useState([])
	const [addingJournal, setAddingJournal] = useState(false)
	const [emptyJournals, setEmptyJournals] = useState(false)

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
			console.log(data.error)
		}

		if (data.journals_list.journals.length === 0)
			setEmptyJournals(true)
		else
			setEmptyJournals(false)
	}

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			const user = jwt.decode(token)
			if (!user) {
				localStorage.removeItem('token')
				window.location.href = '/'
			} else {
				populateJournals()
			}
		} else {
			window.location.href = '/'
		}
	}, [])

	const cleanupEditor = function () {
		populateJournals();
		setAddingJournal(false);
	}

	return (
		<>
			<LogoutButton />
			<AddJournalButton addJournalCallback={ setAddingJournal }/>

			<CleanupEditorContext.Provider value={ cleanupEditor }>
				{addingJournal &&
				<JournalEditor
					journal={ {title: '', content: '', _id: '', new_journal: true } }
				/>}

				<div className="dashboard-title-wrapper">
					<span>Journal App</span>
				</div>

				<div className="dashboard-item-wrapper">
					{ journals.map(journal => (
						<JournalItem
							key={ journal._id }
							journal={ journal }
						/>
					)) }
				</div>
			</CleanupEditorContext.Provider>

			{ emptyJournals &&
				<EmptyJournalsPage/> }
		</>
	)
}

function JournalItem({journal}) {
	const [editingJournal, setEditingJournal] = useState(false)
	const parentCleanupEditor = useContext(CleanupEditorContext)

	const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	const dateCreated = new Date(journal.date)
	const day = dateCreated.getDay()
	const dayNum = dateCreated.getDate()
	const monthNum = dateCreated.getMonth()

	const cleanupEditor = function () {
		parentCleanupEditor();
		setEditingJournal(false);
	}

	return (
		<>
			<CleanupEditorContext.Provider value={ cleanupEditor }>
				{editingJournal &&
					<JournalEditor
						journal={ journal }
					/>}
			</CleanupEditorContext.Provider>

			<div className="preview-wrapper">
				<div className='preview-date-wrapper' id="editor-column">
					<img
						src={ calendar_icon }
						className="icon"
						alt="Calendar icon">
					</img>
					<span className="button-text">
						{ weekdays[day] + ", " + months[monthNum] +  " " + dayNum }
					</span>
				</div>

				<div className='preview-title-wrapper' id="editor-column">
					<span>
						{ journal.title }
					</span>
				</div>

				<div className='preview-content-wrapper' id="editor-column">
					<span>
						{ journal.content }
					</span>
				</div>

				<div className="preview-edit-wrapper" id="editor-column" onClick={ () => setEditingJournal(true) }>
					<img
						src={ edit_icon }
						className="icon"
						alt="Edit icon">
					</img>
					<span className="button-text">
						Edit
					</span>
				</div>

			</div>
		</>
	);
}

function JournalEditor({ journal }) {
	return (
		<div className="journal-wrapper">
			<JournalEditorContentFields journal={ journal } />
			<DeleteJournalButton journal={ journal } />
			<BackButton />
		</div>
	);
}

function JournalEditorContentFields({ journal }) {
	const [newTitle, setNewTitle] = useState(journal.title)
	const [newContent, setNewContent] = useState(journal.content)

	return (
		<>
			<div className="journal-title-wrapper">
				<input
					className="journal-title"
					type="text"
					placeholder="Title"
					value={ newTitle }
					onChange={ (e) => setNewTitle(e.target.value) }
				/>
			</div>

			<hr />

			<div className="journal-interactions-wrapper">
				<div className="journal-content-wrapper">
					<textarea
						className="journal-content"
						placeholder="Type your content here..."
						value={ newContent }
						onChange={ (e) => setNewContent(e.target.value) }
					/>

					<SaveButton
						journal = { journal }
						newTitle = { newTitle }
						newContent = { newContent }
					/>
				</div>
			</div>
		</>
	)
}

function SaveButton({ journal, newTitle, newContent }) {
	const cleanupEditor = useContext(CleanupEditorContext)

	async function updateJournal() {
		const http_method = journal.new_journal ? 'POST' : 'PUT'

		if (journal.title === newTitle && journal.content === newContent) {
			cleanupEditor();
			return;
		}

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

		cleanupEditor();
	}

	return (
		<div className="spacer">
			<div className="save-button-wrapper" onClick={ () => updateJournal() }>
				<img
					src={ save_icon }
					className="save-icon"
					alt="Save journal icon" >
				</img>
				<span className="button-text">
					Save & Exit
				</span>
			</div>
		</div>
	)
}

function BackButton() {
	const cleanupEditor = useContext(CleanupEditorContext)

	return (
		<div className="back-button-wrapper" id="button-wrapper" onClick={ () => cleanupEditor() }>
			<img
				src={ back_icon }
				className="icon"
				alt="Back arrow icon">
			</img>
			<span className="button-text">
				Back
			</span>
		</div>
	)
}

function DeleteJournalButton({ journal }) {
	const deleteIconMessage = journal.new_journal ? 'Discard' : 'Delete'
	const cleanupEditor = useContext(CleanupEditorContext)

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

		cleanupEditor();
	}

	return (
		<div className="delete-button-wrapper" id="button-wrapper" onClick={ () => deleteJournal() }>
			<img
				src={ delete_icon }
				className="icon"
				alt="Delete journal icon">
			</img>
			<span className="button-text">
				{ deleteIconMessage }
			</span>
		</div>
	)
}

function LogoutButton() {

	function logout() {
		localStorage.setItem('token', '')
		window.location.href = '/'
	}

	return (
		<div className="logout-button-wrapper" id="button-wrapper" onClick={ () => logout() }>
			<img
				src={ logout_icon }
				className="icon"
				alt="Logout icon">
			</img>
			<span className="button-text">
				Logout
			</span>
		</div>
	)

}

function AddJournalButton({ addJournalCallback }) {
	return (
		<div className="add-button-wrapper" id="button-wrapper" onClick={ () => addJournalCallback(true) }>
			<img
				src={ add_icon }
				className="icon"
				alt="Add journal icon">
			</img>
			<span className="button-text">
				Add Journal
			</span>
		</div>
	)
}

function EmptyJournalsPage() {

	return (
		<>
			<div className="empty-journals-icon-wrapper">
				<img
					src={ empty_journals_icon }
					className="empty-journals-icon"
					alt="Empty journals icon">
				</img>
			</div>
			<div className="empty-journals-wrapper">
				<span>Looks pretty empty. Get started by adding some journals!</span>
			</div>
		</>
	)
}

export default Dashboard
