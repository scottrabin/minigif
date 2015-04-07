export const CONFIGURE_NEW_IMAGE_WINDOW = "configure_new_image_window";
export const CONFIGURE_SELECT_IMAGE_WINDOW = "configure_select_image_window";

/**
 * Display the popup window to add a new image to the collection
 *
 * @param {string} imageSrc The image source URI
 */
export function showAddImagePopup(imageSrc) {
	chrome.windows.create({
		url:     chrome.extension.getURL('popup_newimage.html'),
		left:    100,
		width:   screen.width - 200,
		top:     100,
		height:  screen.height - 200,
		focused: true,
		type:    "detached_panel"
	}, function(win) {
		chrome.tabs.sendMessage(win.tabs[0].id, {
			type: CONFIGURE_NEW_IMAGE_WINDOW,
			data: {
				image: {
					src: imageSrc
				}
			}
		});
	});
}

export function showSearchPopup(tab) {
	chrome.windows.create({
		url:     chrome.extension.getURL('popup_search.html'),
		left:    screen.width - 225,
		width:   175,
		top:     100,
		height:  screen.height - 200,
		focused: true,
		type:    "detached_panel"
	}, function (win) {
		chrome.tabs.sendMessage(win.tabs[0].id, {
			type: CONFIGURE_SELECT_IMAGE_WINDOW,
			data: {
				tabId: tab.id,
			}
		});
	});
}
