const DB_NAME    = "MiniGIF";
const DB_VERSION = 1;

export const READ = 'readonly';
export const READWRITE = 'readwrite';

export const IMAGE_STORE = 'images';
export const IMAGE_STORE_INDEX_TAG = 'tags';

/**
 * Run a transaction against the database
 *
 * @param {Array<string>} stores The stores to use in the transaction
 * @param {string} mode The mode to use in the transaction; one of READ or READWRITE
 * @param {function(?Error, ?IDBTransaction)} fn The function to execute the
 *        transaction itself
 */
export function transact(stores, mode, fn) {
	getDB(function(err, db) {
		if (err) {
			fn(err, null);
		} else {
			fn(null, db.transaction(stores, mode));
		}
	});
}

/**
 * Get the database, performing upgrades as necessary
 * @private
 *
 * @param {function(?Error, ?IndexedDB)} callback
 */
function getDB(callback) {
	var request = indexedDB.open(DB_NAME, DB_VERSION);
	request.onerror = function onerror(event) {
		console.error('open DB failure: %o', event);
		callback(event.error, null);
	};
	request.onsuccess = function onsuccess(event) {
		console.info('open DB success: %o', event);
		callback(null, event.target.result);
	};

	request.onupgradeneeded = function onupgradeneeded(event) {
		let transaction = event.target.transaction;
		let db = event.target.result;
		console.log('transaction: %o db: %o', transaction, db);

		var imageStore;

		if ( db.objectStoreNames.contains(IMAGE_STORE) ) {
			imageStore = transaction.objectStore(IMAGE_STORE);
		} else {
			imageStore = db.createObjectStore(IMAGE_STORE, {
				"keyPath": "src"
			});
		}

		if ( !imageStore.indexNames.contains(IMAGE_STORE_INDEX_TAG) ) {
			imageStore.createIndex(IMAGE_STORE_INDEX_TAG, 'tags', {
				unique:     false,
				multiEntry: true
			});
		}
	};
}
