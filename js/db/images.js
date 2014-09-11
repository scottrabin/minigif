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
 * @param {function(?Error, ?Array.<Img>)} callback function to execute
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
		var cursor = tagIndex.openCursor(IDBKeyRange.only(tag));

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
