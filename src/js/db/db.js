/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var DB = {};
DB.NAME = "MiniGIF";
DB.VERSION = 3;

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
		var transaction = e.target.transaction;
		var imageStore;

		db.onerror = DB_onerror;
		e.target.transaction.onerror = DB_onerror;

		if (db.objectStoreNames.contains(Images.STORE_NAME)) {
			imageStore = transaction.objectStore(Images.STORE_NAME);
		} else {
			imageStore = db.createObjectStore(Images.STORE_NAME, {
				keyPath: 'src'
			});
		}

		if (!imageStore.indexNames.contains(Images.INDEX_TAG)) {
			imageStore.createIndex(Images.INDEX_TAG, 'tags', {
				unique:     false,
				multiEntry: true
			});
		}
	};

	request.onsuccess = function(e) {
		DB._db = e.target.result;
		callback(null, DB._db);
	};

	request.onerror = function(e) {
		callback(e, null);
	};
};

/**
 * Executes a transaction against the database
 *
 * @param {string} mode Which mode the transaction will execute with (one of
 *        DB.READ or DB.READWRITE)
 * @param {string|Array.<string>} stores Which object stores the transaction
 *        will execute against
 * @param {function(IDBTransaction)} fn The function that will execute the
 *        contents of the transaction
 */
DB.transaction = function transaction(mode, stores, fn) {
	DB.get(function(err, db) {
		if (err) {
			console.error("Unable to get database for transaction:", err);
			return;
		}

		fn(db.transaction(stores, mode));
	});
};

function DB_onerror(e) {
	console.error("Database error:", e);
}
