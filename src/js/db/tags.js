import * as db from './db';

/**
 * Get all of the tags from the database
 *
 * @param {function(?Error, ?Array<string>} callback
 */
export function getTags(callback) {
	db.transact([db.IMAGE_STORE], db.READONLY, function(err, txn) {
		let imageStore = txn.objectStore( db.IMAGE_STORE );
		let tagIndex   = imageStore.index( db.IMAGE_STORE_INDEX_TAG );
		let cursor     = tagIndex.openKeyCursor();
		let result     = {};

		cursor.onsuccess = function onsuccess(event) {
			let curs = event.target.result;
			if ( curs ) {
				result[ curs.key ] = ( result[curs.key] || 0 ) + 1;
				curs.continue();
			} else {
				callback( null, result );
			}
		};

		cursor.onerror = function onerror(event) {
			callback( txn.error, null );
		};
	});
}
