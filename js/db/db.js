/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var DB = {};
DB.NAME = "MiniGIF";
DB.VERSION = 1;

DB.READ = 'readonly';
DB.READWRITE = 'readwrite';

DB._db = null;

/**
 * Get the connection to the DB. Open the connection if it is not already open.
 *
 * @param {function(?Error, ?IDBDatabase)} callback
 */
DB.get = function get(callback) {
	if (DB._db) {
		setTimeout(callback.bind(null, null, DB._db), 0);
		return;
	}

	var request = indexedDB.open(DB.NAME, DB.VERSION);

	request.onupgradeneeded = function(e) {
		var db = e.target.result;

		db.onerror = DB_onerror;
		e.target.transaction.onerror = DB_onerror;

		if (db.objectStoreNames.contains("images")) {
			// image relation already exists
		}

		var imageStore = db.createObjectStore("images", {
			keyPath: "src"
		});
	};

	request.onsuccess = function(e) {
		DB._db = e.target.result;
		callback(null, DB._db);
	};

	request.onerror = function(e) {
		callback(e, null);
	};
};

function DB_onerror(e) {
	console.error("Database error:", e);
}
