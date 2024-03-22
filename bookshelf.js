'use strict';

const bookshelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF';

function isStorageExist() {
	if (typeof Storage === 'undefined') {
		alert('Browser does not support local storage');
		return false;
	}
	return true;
}

function generateBooksObject(id, title, author, year, isComplete) {
	return {
		id,
		title,
		author,
		year,
		isComplete,
	};
}

function addBookList() {
	const title = document.getElementById('judul').value;
	const author = document.getElementById('penulis').value;
	const year = document.getElementById('tahun').value;
	const isComplete = document.getElementById('selesai-dibaca').checked;

	const generateId = +new Date();
	const bookObject = generateBooksObject(generateId, title, author, parseInt(year), isComplete);
	bookshelf.push(bookObject);

	console.log(bookshelf);

	Toastify({
		text: 'Buku berhasil ditambahkan',
		duration: 2000,
		close: true,
		gravity: 'top',
		position: 'right',
		style: {
			background: 'linear-gradient(to right, #00b09b, #96c93d)',
			fontFamily: 'Inter',
		},
	}).showToast();

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function makeBook(bookObject) {
	const textTitle = document.createElement('li');
	textTitle.innerText = bookObject.title;

	const textAuthor = document.createElement('li');
	textAuthor.innerText = `Author: ${bookObject.author}`;

	const textYear = document.createElement('li');
	textYear.innerText = `Year: ${bookObject.year}`;

	const textContainer = document.createElement('ul');
	textContainer.classList.add('book-item');

	textContainer.append(textTitle, textAuthor, textYear);

	const containerIcon = document.createElement('div');
	containerIcon.classList.add('container-icon');

	const container = document.createElement('div');
	container.classList.add('book-list');
	container.setAttribute('id', `book-${bookObject.id}`);
	container.append(textContainer, containerIcon);

	const trashIcon = document.createElement('i');
	trashIcon.classList.add('bi', 'bi-trash');
	trashIcon.addEventListener('click', () => {
		swal({
			title: 'Yakin ingin menghapus?',
			text: 'Apabila dihapus, tidak dapat dikembalikan lagi',
			icon: 'warning',
			className: 'Inter',
			buttons: true,
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
				removeBook(bookObject.id);
				swal('Poof! Buku anda sudah dihapus', {
					icon: 'success',
					className: 'Inter',
				});
			}
		});
	});

	if (bookObject.isComplete) {
		const undoIcon = document.createElement('i');
		undoIcon.classList.add('bi', 'bi-arrow-counterclockwise');
		undoIcon.addEventListener('click', () => {
			moveToUncompletedBook(bookObject.id);
		});

		containerIcon.append(undoIcon, trashIcon);
	} else {
		const checkIcon = document.createElement('i');
		checkIcon.classList.add('bi', 'bi-check2-circle');
		checkIcon.addEventListener('click', () => {
			moveToCompletedBook(bookObject.id);
		});

		containerIcon.append(checkIcon, trashIcon);
	}

	return container;
}

function removeBook(bookId) {
	const bookIndex = findBookIndex(bookId);

	if (bookIndex == -1) return;

	bookshelf.splice(bookIndex, 1);

	Toastify({
		text: 'Buku Telah Dihapus',
		duration: 2000,
		close: true,
		gravity: 'top',
		position: 'right',
		style: {
			background: 'linear-gradient(to right, #FF7878, #FF0000)',
			fontFamily: 'Inter',
		},
	}).showToast();

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function moveToCompletedBook(bookId) {
	const bookPosition = findBookIndex(bookId);

	if (bookPosition == null || bookPosition.isComplete) return;

	bookPosition.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function moveToUncompletedBook(bookId) {
	const bookPosition = findBookIndex(bookId);

	if (!bookPosition) return;

	bookPosition.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function findBookIndex(bookId) {
	for (const bookItem of bookshelf) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}
}

function searchingBook(keyword) {
	const uncompletedBookslist = document.getElementById('uncompleted-bookshelf-list');
	const completedBooksList = document.getElementById('completed-bookshelf-list');

	uncompletedBookslist.innerHTML = '';
	completedBooksList.innerHTML = '';

	let hasUncompletedBooks = false;
	let hasCompletedBooks = false;

	const filteredBooks = bookshelf.filter((book) =>
		book.title.toLowerCase().includes(keyword.toLowerCase()),
	);

	for (const bookItem of filteredBooks) {
		const bookElement = makeBook(bookItem);
		if (!bookItem.isComplete) {
			uncompletedBookslist.append(bookElement);
			hasUncompletedBooks = true;
		} else {
			completedBooksList.append(bookElement);
			hasCompletedBooks = true;
		}
	}
	displayEmptyBookMessage(hasUncompletedBooks, hasCompletedBooks);
}

function saveData() {
	if (isStorageExist()) {
		const parsed = JSON.stringify(bookshelf);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializedData);

	if (data) {
		for (const book of data) {
			bookshelf.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, () => {
	const uncompletedBookslist = document.getElementById('uncompleted-bookshelf-list');
	const completedBooksList = document.getElementById('completed-bookshelf-list');

	uncompletedBookslist.innerHTML = '';
	completedBooksList.innerHTML = '';

	let hasUncompletedBooks = false;
	let hasCompletedBooks = false;

	for (const bookItem of bookshelf) {
		const bookElement = makeBook(bookItem);
		if (!bookItem.isComplete) {
			uncompletedBookslist.append(bookElement);
			hasUncompletedBooks = true;
		} else {
			completedBooksList.append(bookElement);
			hasCompletedBooks = true;
		}
	}

	displayEmptyBookMessage(hasUncompletedBooks, hasCompletedBooks);
});

function displayEmptyBookMessage(hasUncompletedBooks, hasCompletedBooks) {
	const emptyUncompletedMessage = document.getElementById('empty-uncompleted-message');
	const emptyCompletedMessage = document.getElementById('empty-completed-message');

	emptyUncompletedMessage.style.display = hasUncompletedBooks ? 'none' : 'block';
	emptyCompletedMessage.style.display = hasCompletedBooks ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
	const submitBook = document.getElementById('input-book');
	const year = document.getElementById('tahun');
	year.addEventListener('keydown', function (e) {
		if (this.value.length >= 4 && e.keyCode !== 8 && e.keyCode !== 13) {
			e.preventDefault();
		}
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}

	submitBook.addEventListener('submit', (e) => {
		e.preventDefault();
		addBookList();
		submitBook.reset();
	});

	const searchForm = document.getElementById('search-book');
	const searchInput = document.getElementById('search-input');
	searchForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const keyword = searchInput.value;
		searchingBook(keyword);
	});

	console.table(bookshelf);
});