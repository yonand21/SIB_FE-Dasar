const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  } 
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addbook();
  });
});

function addbook() {
  const textbook = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const timestamp = document.getElementById("date").value;

  const generatedID = generateId();
  const bookObject = generatebookObject(
    generatedID,
    textbook,
    author,
    timestamp,
    false
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generatebookObject(id, bookTitle, bookAuthor, timestamp, isCompleted) {
  return {
    id,
    bookTitle,
    bookAuthor,
    timestamp,
    isCompleted,
  };
}

function search() {
  let searchValue = document.getElementById("search").value.toLowerCase();

  let items = document.getElementById("title");

  for (let i = 0; i < items.length; i++) {
    let itemValue = items[i].innerText.toLowerCase();

    if (itemValue.indexOf(searchValue) > -1) {
      items[i].style.display = "";
    } else {
      items[i].style.display = "none";
    }
  }
}

function makebook(bookObject) {
  const textTitle = document.createElement("h1");
  textTitle.innerText = bookObject.bookTitle;

  const textAuthor = document.createElement("h2");
  textAuthor.innerText = bookObject.bookAuthor;

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = bookObject.timestamp;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });

    container.append(checkButton);

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });
    container.append(trashButton);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findbook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findbook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findbookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findbook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function findbookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedbookList = document.getElementById("books");
  uncompletedbookList.innerHTML = "";

  const completedbookList = document.getElementById("completed-books");
  completedbookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makebook(bookItem);
    if (!bookItem.isCompleted) uncompletedbookList.append(bookElement);
    else completedbookList.append(bookElement);
  }
});

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
});
