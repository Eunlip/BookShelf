'use strict';

const bookShelf = [];
const RENDER_EVENT = 'render-bookShelf';
const SAVED_EVENT = 'saved-bookShelf';
const STORAGE_KEY = 'BOOKSHELF';

document.addEventListener('DOMContentLoaded', () => {
	const submitBook = document.getElementById('input_book');
	submitBook.addEventListener('submit', function (e) {
		e.preventDefault();
		addBookList();
	});

	const searchBook = document.getElementById('search_book');
	const searchBookInput = document.getElementById('search_book_input');
	searchBook.addEventListener('submit', e => {
		e.preventDefault();
		searching(searchBookInput.value.toLowerCase());
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

document.addEventListener(RENDER_EVENT, () => {
	const unfinishedReading = document.getElementById('unfinish_bookshelf_list');
	unfinishedReading.innerHTML = '';

	const finishedReading = document.getElementById('finish_bookshelf_list');
	finishedReading.innerHTML = '';

	for (const bookItem of bookShelf) {
		const bookEl = makeBookList(bookItem);
		if (!bookItem.isComplete) {
			unfinishedReading.append(bookEl);
		} else {
			finishedReading.append(bookEl);
		}
	}
});

const generatedID = () => +new Date();

function generateBookShelfObject(id, title, author, year, isComplete) {
	return {
		id,
		title,
		author,
		year,
		isComplete,
	};
}

function addBookList() {
	const titleBook = document.getElementById('input_book_title').value;
	const authorBook = document.getElementById('input_book_author').value;
	const yearBook = document.getElementById('input_book_year').value;
	const isComplete = document.getElementById('input_book_iscomplete').checked;

	const generateID = generatedID();
	const bookShelfObject = generateBookShelfObject(generateID, titleBook, authorBook, yearBook, isComplete);

	bookShelf.push(bookShelfObject);

	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function makeBookList(bookShelfObject) {
	const textTitle = document.createElement('h3');
	textTitle.innerText = bookShelfObject.title;

	const textAuthor = document.createElement('p');
	textAuthor.innerText = `Author : ${bookShelfObject.author}`;

	const textYear = document.createElement('p');
	textYear.innerText = `Year : ${bookShelfObject.year}`;

	const textContainer = document.createElement('div');
	textContainer.classList.add('book_item');
	textContainer.setAttribute('id', `bookList-${bookShelfObject.id}`);
	textContainer.append(textTitle, textAuthor, textYear);

	if (bookShelfObject.isComplete) {
		const unFinishedReadingBtn = document.createElement('button');
		unFinishedReadingBtn.classList.add('green');
		unFinishedReadingBtn.innerText = 'Unfinished Reading';

		unFinishedReadingBtn.addEventListener('click', () => {
			moveToUncompleteRead(bookShelfObject.id);
		});

		const removeBookBtn = document.createElement('button');
		removeBookBtn.classList.add('red');
		removeBookBtn.innerText = 'Remove Book';

		removeBookBtn.addEventListener('click', () => {
			removeBooks(bookShelfObject.id);
		});

		const editBookBtn = document.createElement('button');
		editBookBtn.classList.add('yellow');
		editBookBtn.innerText = 'Edit Book';
		editBookBtn.addEventListener('click', () => {
			openEditModal(bookShelfObject.id);
		});

		const containerBtn = document.createElement('div');
		containerBtn.classList.add('action');
		containerBtn.append(unFinishedReadingBtn, removeBookBtn, editBookBtn);

		textContainer.append(containerBtn);
	} else {
		const finishedReadingBtn = document.createElement('button');
		finishedReadingBtn.classList.add('green');
		finishedReadingBtn.innerText = 'Finish Reading';

		finishedReadingBtn.addEventListener('click', () => {
			moveToCompleteRead(bookShelfObject.id);
		});

		const removeBookBtn = document.createElement('button');
		removeBookBtn.classList.add('red');
		removeBookBtn.innerText = 'Remove Book';

		removeBookBtn.addEventListener('click', () => {
			removeBooks(bookShelfObject.id);
		});

		const editBookBtn = document.createElement('button');
		editBookBtn.classList.add('yellow');
		editBookBtn.innerText = 'Edit Book';
		editBookBtn.addEventListener('click', () => {
			openEditModal(bookShelfObject.id);
		});

		const containerBtn = document.createElement('div');
		containerBtn.classList.add('action');
		containerBtn.append(finishedReadingBtn, removeBookBtn, editBookBtn);

		textContainer.append(containerBtn);
	}

	return textContainer;
}

function moveToCompleteRead(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null || bookTarget.isComplete) return;

	bookTarget.isComplete = true;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function moveToUncompleteRead(bookId) {
	const bookTarget = findBook(bookId);

	if (bookTarget == null) return;

	bookTarget.isComplete = false;
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function removeBooks(bookId) {
	const bookTarget = findBookIndex(bookId);

	if (bookTarget == -1) return;

	bookShelf.splice(bookTarget, 1);
	document.dispatchEvent(new Event(RENDER_EVENT));
	saveData();
}

function openEditModal(bookId) {
	const editModal = document.getElementById('edit_modal');
	const editForm = document.getElementById('edit_form');

	const bookToEdit = findBook(bookId);
	if (bookToEdit) {
		document.getElementById('edit_book_title').value = bookToEdit.title;
		document.getElementById('edit_book_author').value = bookToEdit.author;
		document.getElementById('edit_book_year').value = bookToEdit.year;

		editForm.addEventListener('submit', e => {
			e.preventDefault();
			saveEditedBook(bookId);
			editModal.style.display = 'none';
		});
		editModal.style.display = 'block';
	}
}

function saveEditedBook(bookId) {
	const editedBook = {
		id: bookId,
		title: document.getElementById('edit_book_title').value,
		author: document.getElementById('edit_book_author').value,
		year: document.getElementById('edit_book_year').value,
		isComplete: findBook(bookId).isComplete,
	};

	const index = findBookIndex(bookId);

	if (index !== -1) {
		bookShelf[index] = editedBook;
		document.dispatchEvent(new Event(RENDER_EVENT));
		saveData();
	}
}

const closeModalBtn = document.querySelector('.close');
closeModalBtn.addEventListener('click', () => {
	const editModal = document.getElementById('edit_modal');
	editModal.style.display = 'none';
});

window.addEventListener('click', e => {
	const editModal = document.getElementById('edit_modal');
	if (e.target === editModal) {
		editModal.style.display = 'none';
	}
});

function findBook(bookId) {
	for (const bookItem of bookShelf) {
		if (bookItem.id === bookId) {
			return bookItem;
		}
	}
	return null;
}

function findBookIndex(bookId) {
	for (const index in bookShelf) {
		if (bookShelf[index].id === bookId) {
			return index;
		}
	}
	return -1;
}

function searching(value) {
	const unfinishedReading = document.getElementById('unfinish_bookshelf_list');
	const finishedReading = document.getElementById('finish_bookshelf_list');

	const unfinishedResult = searchBooks(
		bookShelf.filter(book => !book.isComplete),
		value
	);
	showBooksFilter(unfinishedReading, unfinishedResult);

	const finishedResult = searchBooks(
		bookShelf.filter(book => book.isComplete),
		value
	);
	showBooksFilter(finishedReading, finishedResult);
}

function searchBooks(books, value) {
	if (!value) {
		return books;
	}
	return books.filter(book => book.title.toLowerCase().includes(value));
}

function showBooksFilter(container, showBooks) {
	container.innerHTML = '';
	if (showBooks.length === 0) {
		const noResultMessage = document.createElement('p');
		noResultMessage.innerText = 'No results found.';
		container.appendChild(noResultMessage);
	} else {
		showBooks.forEach(book => {
			const bookItem = makeBookList(book);
			container.append(bookItem);
		});
	}
}

function saveData() {
	if (isStorageExist()) {
		const parsed = JSON.stringify(bookShelf);
		localStorage.setItem(STORAGE_KEY, parsed);
		document.dispatchEvent(new Event(SAVED_EVENT));
	}
}

function isStorageExist() {
	if (typeof Storage === undefined) {
		alert("Your Browser doesn't have local storage");
		return false;
	}
	return true;
}

function loadDataFromStorage() {
	const serializeData = localStorage.getItem(STORAGE_KEY);
	let data = JSON.parse(serializeData);

	if (data !== null) {
		for (const book of data) {
			bookShelf.push(book);
		}
	}

	document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, () => {
	console.log('Data telah diperbarui');
});
