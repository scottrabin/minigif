/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var Images = {};

Images.STORE_NAME = 'images';
Images.INDEX_TAG  = 'tags';

/**
 * Save an image into the database. Updates existing images if they already
 * exist, or creates a new record otherwise.
 *
 * @param {string} imgSrc The image URI
 * @param {Array.<string>} tags Tags that apply to the given image
 * @param {function(?Error, ?GIFImage)} callback function to execute
 *        when the save completes
 */
Images.save = function images_save(imgSrc, tags, callback) {
	DB.transaction(DB.READWRITE, [Images.STORE_NAME], function(trans) {
		var imageStore = trans.objectStore(Images.STORE_NAME);

		var img = {
			src:  imgSrc,
			tags: (Array.isArray(tags) ? tags : [].concat(tags))
		};
		imageStore.put(img);

		trans.oncomplete = function(e) {
			callback(trans.error, img);
		};

		trans.onerror = function(evt) {
			callback(trans.error, null);
		};
	});
};

/**
 * Get all images tagged with the given query from the database
 *
 * @param {string} tag
 * @param {function(?Error, Array.<Img>} callback
 */
Images.getByTag = function images_getbytag(tag, callback) {
	DB.transaction(DB.READWRITE, [Images.STORE_NAME], function(trans) {
		var imageStore = trans.objectStore(Images.STORE_NAME);
		var tagIndex   = imageStore.index(Images.INDEX_TAG);

		var imgs   = [];
		var cursor = tagIndex.openCursor(getPartialKeyRange(tag));

		cursor.onsuccess = function(evt) {
			var curs = event.target.result;
			if (curs) {
				imgs.push(curs.value);
				curs.continue();
			} else {
				callback(null, imgs);
			}
		};
	});
};

/**
 * Get a list of all tags in the database
 *
 * @param {function(?Error, Array.<string>)} callback
 */
Images.getTags = function images_gettags(callback) {
	DB.transaction(DB.READWRITE, [Images.STORE_NAME], function(trans) {
		var imageStore = trans.objectStore(Images.STORE_NAME);
		var tagIndex   = imageStore.index(Images.INDEX_TAG);

		var tags   = {};
		var cursor = tagIndex.openKeyCursor();
		cursor.onsuccess = function(evt) {
			var curs = evt.target.result;
			if ( curs ) {
				tags[curs.key] = true;
				curs.continue();
			} else {
				callback( null, Object.keys(tags) );
			}
		};

		cursor.onerror = function(evt) {
			callback( evt.target.error, [] );
		};
	});
};

function getPartialKeyRange(key) {
	var upperBound = key.substring(0, key.length - 1);
	upperBound += String.fromCharCode(key.charCodeAt(key.length - 1) + 1);

	return IDBKeyRange.bound(key, upperBound, false, true);
}
