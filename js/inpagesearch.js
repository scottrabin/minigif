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

	switch ( msg.data.format ) {
	case 'raw':
		insertText( element, msg.data.img.src, offsetStart, offsetEnd );
		break;
	case 'html':
		var el = document.createElement('img');
		el.setAttribute('src', msg.data.img.src);
		// TODO insert the actual element if the target element can accept it
		insertText( element, el.outerHTML, offsetStart, offsetEnd );
		break;
	case 'markdown':
		var ins = "[" + msg.data.img.src + "](" + msg.data.img.src + ")";
		insertText( element, ins, offsetStart, offsetEnd );
		break;
	default:
		console.error("Unknown format: %s", msg.data.format);
	}

	element     = null;
	offsetStart = null;
	offsetEnd   = null;

	// allow remote end to be notified that this is complete
	sendResponse();
});

function insertText(element, text, start, end) {
	var changeEvt = new Event('change', {
		'bubbles': true,
		'cancelable': false
	});
	element.dispatchEvent(changeEvt);

	element.value = element.value.substr(0, start) + text + element.value.substr(end);

	element.selectionStart = start;
	if (start === end) {
		element.selectionStart += text.length;
		element.selectionEnd = element.selectionStart;
	} else {
		element.selectionEnd = start + text.length;
	}

	// fire an input event, so that listeners may react to the inserted text
	var inputEvt = new Event('input', {
		'bubbles':     true,
		'cancelable':  false,
		'isComposing': false,
		'data':        text
	});
	return !element.dispatchEvent(inputEvt);
}
