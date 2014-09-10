/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

// Create the context menu item to add new images
chrome.contextMenus.create({
	"title":    "MiniGIF: Add to collection",
	"id":       "add-image",
	"contexts": ["image"],
	"onclick":  addImageToCollection
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	switch (msg.action) {
	case 'display_new_image_window':
		showAddImagePopup(msg.data.imgSrc);

		return false;
	case 'add_image':
		Images.save(msg.data.imgSrc, msg.data.tags, function(err, img) {
			if (err) {
				console.error("Unable to save image:", err);
				return;
			}

			sendResponse(img);
		});

		return true;
	}
});

/**
 * Add the selected image to the MiniGIF collection
 *
 * @param {contextMenusInternal.OnClickData} info
 * @param {tabs.Tab} tab
 */
function addImageToCollection(info, tab) {
	chrome.runtime.sendMessage({
		action: "display_new_image_window",
		data: {
			imgSrc: info.srcUrl
		}
	});
}

/**
 * Display the popup window to add a new image to the collection
 *
 * @param {string} imgSrc The image source URI
 */
function showAddImagePopup(imgSrc) {
	chrome.windows.create({
		url:     "popup_newimage.html",
		left:    100,
		width:   screen.width - 200,
		top:     100,
		height:  screen.height - 200,
		focused: true,
		type:    "detached_panel"
	}, function(win) {
		chrome.tabs.sendMessage(win.tabs[0].id, {imgSrc: imgSrc});
	});
}
