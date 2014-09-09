/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

// Create the context menu item to add new images
chrome.contextMenus.create({
	"title": "MiniGIF: Add to collection",
	"id": "add-image",
	"contexts": ["image"],
	"onclick": addImageToCollection
});

/**
 * Add the selected image to the MiniGIF collection
 *
 * @param {contextMenusInternal.OnClickData} info
 * @param {tabs.Tab} tab
 */
function addImageToCollection(info, tab) {
	console.group("MiniGIF: Adding image to collection");

	console.dir(info);
	console.dir(tab);
	chrome.extension.getBackgroundPage().Images.save(info.srcUrl, [], function(err, img) {
		console.log("OK", img);
	});

	console.groupEnd();
}
