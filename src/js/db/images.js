import * as db from './db'
import { unique } from 'lodash'

/**
 * Domain object representation of images in the database
 * @class
 */
export class MiniImage {
	constructor(src, tags) {
		this.src  = src;
		this.tags = new Set( tags );
	}
	toJSON() {
		let tags = [];
		this.tags.forEach((tag) => tags.push(tag));

		return {
			src:  this.src,
			tags: tags
		};
	}
}

/** @const MiniImage */
MiniImage.EMPTY = new MiniImage( "", [] );

// TODO
MiniImage.fromJSON = function fromJSON(json) {
	return new MiniImage( json.src, json.tags );
};

/**
 * Save a new image into the database
 *
 * @param {MiniImage} image the image to persist
 * @param {function(?Error, ?MiniImage)} callback function to execute when the save
 *        has completed
 */
export function save(image, callback) {
	db.transact([db.IMAGE_STORE], db.READWRITE, function(err, txn) {
		if ( err ) {
			callback( err, null );
			return;
		}

		let imageStore = txn.objectStore( db.IMAGE_STORE );

		imageStore.put( image.toJSON() );

		txn.oncomplete = function oncomplete(event) {
			callback( txn.error, image );
		};
		txn.onerror = function onerror(event) {
			callback( txn.error, image );
		};
	});
}

/**
 * Get an image from the database by its src attribute
 *
 * @param {string} imageSrc
 * @param {function(?Error, ?MiniImage)} callback
 */
export function getBySrc(imageSrc, callback) {
	db.transact([db.IMAGE_STORE], db.READONLY, function(err, txn) {
		if ( err ) {
			callback( err, null );
			return;
		}

		let imageStore = txn.objectStore(db.IMAGE_STORE);
		let request    = imageStore.get(imageSrc);

		request.onsuccess = function onsuccess(event) {
			if ( event.target.result ) {
				callback( null, MiniImage.fromJSON(event.target.result) );
			} else {
				callback( null, null );
			}
		};
		request.onerror   = function onerror(event) {
			callback( event.target.error, null );
		};
	});
}

/**
 * Get all images in the database with a partial match to the given tag
 *
 * @param {string} tagPartial
 * @param {function(?Error, ?Array<Image>)} callback
 */
export function getByTagPartial(tagPartial, callback) {
	getImagesByKeyRange( getPartialKeyRange(tagPartial), callback );
}

/**
 * Get all images matching a specific tag
 *
 * @param {string} tag
 * @param {function(?Error, ?Array<MiniImage>} callback
 */
export function getByTag(tag, callback) {
	getImagesByKeyRange( IDBKeyRange.only(tag), callback );
}

/**
 * Gets images from the database using the specified key range
 * @private
 *
 * @param {IDBKeyRange} range
 * @param {function(?Error, ?Array<MiniImage>} callback
 */
function getImagesByKeyRange(range, callback) {
	db.transact([db.IMAGE_STORE], db.READONLY, function(err, txn) {
		if ( err ) {
			callback( err, null );
			return;
		}

		let imageStore = txn.objectStore( db.IMAGE_STORE );
		let tagIndex   = imageStore.index( db.IMAGE_STORE_INDEX_TAG );
		let images     = [];
		let cursor     = tagIndex.openCursor( range );

		cursor.onsuccess = function onsuccess(event) {
			var curs = event.target.result;
			if ( curs ) {
				images.push( curs.value );
				curs.continue();
			} else {
				callback( null, images );
			}
		};
		cursor.onerror = function onerror(event) {
			callback( txn.error, null );
		};
	});
}

/**
 * Get a key range that will match a partial key and any following characters
 * after that key (e.g. "abc" will match "abcd" and "abce" but not "abd")
 * @private
 *
 * @param {string} key
 * @return {IDBKeyRange}
 */
function getPartialKeyRange(key) {
	var upperBound = key.substring(0, key.length - 1);
	upperBound += String.fromCharCode(key.charCodeAt(key.length - 1) + 1);

	return IDBKeyRange.bound(key, upperBound, false, true);
}
