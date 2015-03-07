/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var targetTab;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action !== 'configure_select_image_window') {
		return;
	}

	targetTab = msg.data.tabId;
});

/**
 * insertImage finishes the image selection process by sending the image source
 * URI back to the target tab, to be inserted into the page as necessary
 *
 * @param {GIFImage} img
 * @param {string} format
 */
function insertImage(img, format) {
	if ( !targetTab ) {
		return;
	}

	chrome.tabs.sendMessage(targetTab, {
		action: 'insert_image',
		data: {
			format: format,
			img:    img
		}
	}, function() {
		window.close();
	});
}

window.addEventListener('load', function init() {
	var bgPage = chrome.extension.getBackgroundPage();

	var keypressFormatMap = {
		"Enter": "auto",
		"c": "clipboard",
		"e": "embed",
		"h": "html",
		"m": "markdown",
		"r": "raw"
	};

	React.renderComponent(ImageSearch({
		Images: bgPage.Images,
		onKeyPress: function(evt, img) {
			var format = keypressFormatMap[ evt.key ];
			if ( format ) {
				insertImage(img, format);
			}
		},
		onClick: function(evt, img) {
			insertImage(img, keypressFormatMap["Enter"]);
		}
	}), document.getElementById('image-search'));

}, false);
