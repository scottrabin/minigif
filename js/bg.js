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

// When the browser action is clicked, open the options page
chrome.browserAction.onClicked.addListener(function(currentTab) {
	var optionsUrl = chrome.extension.getURL('manage.html');

	chrome.tabs.query({ url: optionsUrl }, function(tabs) {
		if ( tabs.length ) {
			chrome.tabs.update( tabs[0].id, { active: true } );
		} else {
			chrome.tabs.create( { url: optionsUrl } );
		}
	});
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	switch (msg.action) {
	case 'display_new_image_window':
		showAddImagePopup(msg.data.img.src);

		return false;
	case 'add_image':
		Images.save(msg.data.src, msg.data.tags, function(err, img) {
			if (err) {
				console.error("Unable to save image:", err);
				return;
			}

			sendResponse(img);
		});

		return true;
	}
});

chrome.commands.onCommand.addListener(function(command) {
	switch (command) {
	case 'show-search':
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			showSearchPopup(tabs[0]);
		});
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
			img: {
				src: info.srcUrl
			}
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
		chrome.tabs.sendMessage(win.tabs[0].id, {
			action: "configure_new_image_window",
			data: {
				img: {
					src: imgSrc
				}
			}
		});
	});
}

function showSearchPopup(tab) {
	chrome.tabs.executeScript(null, { file: "js/inpagesearch.js" }, function(v) {
		chrome.windows.create({
			url:     "search.html",
			left:    screen.width - 225,
			width:   175,
			top:     100,
			height:  screen.height - 200,
			focused: true,
			type:    "detached_panel"
		}, function (win) {
			chrome.tabs.sendMessage(win.tabs[0].id, {
				action: 'configure_select_image_window',
				data:   {
					tabId: tab.id,
				}
			});
		});
	});
}
