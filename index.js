//the database reference
let db;

var counter = 0;

//initializes the database
function initDatabase() {
	//create a unified variable for the browser variant
	window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;

	window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

	//if a variant wasn't found, let the user know
	if (!window.indexedDB) {
		window.alert("Your browser doesn't support a stable version of IndexedDB.");
	}

	//attempt to open the database
	let request = window.indexedDB.open('tasklist', 1);
	request.onerror = function(event) {
		console.log(event);
	};

	//map db to the opening of a database
	request.onsuccess = function(event) {
		db = request.result;
		console.log('success: ' + db);
		count();
		renderTaskList();
	};

	//if no database, create one and fill it with data
	request.onupgradeneeded = function(event) {
		var db = event.target.result;
		var objectStore = db.createObjectStore('tasklist', { keyPath: 'order' });
	};
}
function order() {
	counter += 1;
}
function count() {
	var objectStore = db.transaction('tasklist').objectStore('tasklist');

	//creates a cursor which iterates through each record
	objectStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;

		if (cursor) {
			order();

			cursor.continue();
		} else {
			console.log('No more entries!');
		}
	};
}
function add() {
	clearList();
	order();
	//get a reference to the fields in html
	let task = document.querySelector('#input-field').value;
	//create a transaction and attempt to add data
	var request = db
		.transaction([ 'tasklist' ], 'readwrite')
		.objectStore('tasklist')
		.add({ task: task, order: counter });

	request.onsuccess = function(event) {
		renderTaskList();
	};

	//when not successfully added to the database
	request.onerror = function(event) {
		console.log(`Unable to add data\r\n${task} is already in your database! `);
	};
}
function renderTaskList() {
	var objectStore = db.transaction('tasklist').objectStore('tasklist');

	//creates a cursor which iterates through each record
	objectStore.openCursor().onsuccess = function(event) {
		var cursor = event.target.result;

		if (cursor) {
			console.log('task: ' + cursor.value.task);
			addEntry(cursor.value.task, cursor.value.order);
			cursor.continue();
		} else {
			console.log('No more entries!');
		}
	};
}
function addEntry(task, counter) {
	// Your existing code unmodified...
	var iDiv = document.createElement('div');
	iDiv.className = 'entry p-2';
	iDiv.innerHTML = task + '<button class="X" onclick="remove(' + counter + ')">X</button>';
	document.querySelector('#entries').appendChild(iDiv);
}
function clearList() {
	document.querySelector('#entries').innerHTML = '';
}
function remove(item) {
	var request = db.transaction([ 'tasklist' ], 'readwrite').objectStore('tasklist').delete(item);
	clearList();
	renderTaskList();
}
initDatabase();
