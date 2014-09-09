/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var Images = {};

Images.STORE_NAME = "images";

/**
 * Gets a transaction for the image store
 *
 * @param {string} mode The transaction mode (DB.READWRITE or DB.READ)
 * @param {function(?Error, ?IDBTransaction)} callback
 */
Images._getTransaction = function images_gettransaction(mode, callback) {
	DB.get(function(err, db) {
		if (err) {
			console.err("Could not get transaction for images;", err);
			return;
		}

		callback(null, db.transaction([Images.STORE_NAME], mode) );
	});
};

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
	Images._getTransaction(DB.READWRITE, function(err, trans) {
		var store = trans.objectStore(Images.STORE_NAME);
		var request = store.put({
			src: imgSrc,
			tags: (Array.isArray(tags) ? tags : [].concat(tags))
		});

		trans.oncomplete = function(e) {
			callback(null, null);
		};

		trans.onerror = function(e) {
			callback(e, null);
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
	setTimeout(callback.bind(null, new Error("Not implemented"), null), 0);
};

/**
 * Get all images in a specified range (for browsing)
 *
 * @param {number} begin
 * @param {number} end
 * @param {function(?Error, ?Array.<Img>} callback
 */
Images.getRange = function images_getrange(begin, end, callback) {
	Images._getTransaction(DB.READ, function(err, trans) {
		var store = trans.objectStore(Images.STORE_NAME);
		var cursor = store.openCursor();

		var ret = [];
		cursor.onsuccess = function(evt) {
			if (evt.target.result) {
				ret.push(evt.target.result.value.src);

				event.target.result.continue();
			}
		};

		trans.oncomplete = function(evt) {
			callback(null, ret);
		};

		trans.onerror = function(evt) {
			callback(evt.target.error, null);
		};
	});
};
