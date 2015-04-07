import * as popup from "./actions/popup"
import * as commands from "./commands"

// Create the context menu item to add new images
chrome.contextMenus.create({
	"title":    "MiniGIF: Add to collection",
	"id":       "add-image",
	"contexts": ["image"],
	"onclick":  addImageToCollection
});

// When the browser action is clicked, open the options page
chrome.browserAction.onClicked.addListener(function(currentTab) {
	let optionsUrl = chrome.extension.getURL('manage.html');

	chrome.tabs.query({ url: optionsUrl }, function(tabs) {
		if ( tabs.length > 0 ) {
			chrome.tabs.update( tabs[0].id, { active: true } );
		} else {
			chrome.tabs.create( { url: optionsUrl } );
		}
	});
});

chrome.commands.onCommand.addListener(function(command) {
	switch ( command ) {
	case commands.SHOW_SEARCH:
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			popup.showSearchPopup( tabs[0] );
		});
		break;
	}
});

/**
 * Add the selected image to the MiniGIF collection
 *
 * @param {contextMenusInternal.OnClickData} info
 * @param {tabs.Tab} tab
 */
function addImageToCollection(info, tab) {
	popup.showAddImagePopup( info.srcUrl )
}
