/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var element     = document.activeElement;
var offsetStart = document.activeElement.selectionStart;
var offsetEnd   = document.activeElement.selectionEnd;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action !== 'insert_image' || !element) {
		return;
	}

	element.value = element.value.substr(0, offsetStart) +
		msg.data.img.src +
		element.value.substr(offsetEnd);

	element.selectionStart = offsetStart;
	if (offsetStart === offsetEnd) {
		element.selectionStart += msg.data.img.src.length;
		element.selectionEnd = element.selectionStart;
	} else {
		element.selectionEnd = offsetStart + msg.data.img.src.length;
	}

	element     = null;
	offsetStart = null;
	offsetEnd   = null;

	// allow remote end to be notified that this is complete
	sendResponse();
});
