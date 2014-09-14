/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var element = document.activeElement;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.action !== 'insert_image' || !element) {
		return;
	}

	switch ( msg.data.format ) {
	case 'raw':
		insertImage( element, msg.data.img.src );
		break;
	case 'html':
		var el = document.createElement('img');
		el.setAttribute('src', msg.data.img.src);
		// TODO insert the actual element if the target element can accept it
		insertImage( element, (element.isContentEditable ? el : el.outerHTML) );
		break;
	case 'markdown':
		insertImage( element, "[" + msg.data.img.src + "](" + msg.data.img.src + ")" );
		break;
	default:
		console.error("Unknown format: %s", msg.data.format);
	}

	element     = null;

	// allow remote end to be notified that this is complete
	sendResponse();
});

function insertImage(element, value) {
	var changeEvt = new Event('change', {
		'bubbles': true,
		'cancelable': false
	});
	element.dispatchEvent(changeEvt);

	replaceCurrentSelection(element, value);

	// fire an input event, so that listeners may react to the inserted text
	var inputEvt = new Event('input', {
		'bubbles':     true,
		'cancelable':  false,
		'isComposing': false,
		'data':        (typeof value === 'string' ? value : value.outerHTML)
	});
	return !element.dispatchEvent(inputEvt);
}

function replaceCurrentSelection(element, value) {
	if ( element.isContentEditable ) {
		replaceCurrentSelection_isContentEditable(element, value);
	} else {
		replaceCurrentSelection_notContentEditable(element, value);
	}
}

function replaceCurrentSelection_notContentEditable(element, value) {
	var offsetStart = element.selectionStart;
	var offsetEnd   = element.selectionEnd;

	element.value = element.value.substr(0, offsetStart) +
		value + element.value.substr(offsetEnd);

	element.selectionStart = offsetStart;
	if ( offsetStart === offsetEnd ) {
		element.selectionStart += value.length;
		element.selectionEnd = element.selectionStart;
	} else {
		element.selectionEnd = offsetStart + value.length;
	}
}

function replaceCurrentSelection_isContentEditable(element, value) {
	var selection = window.getSelection();
	var range     = selection.getRangeAt(0);
	var node      = value;

	if ( !node.nodeType ) {
		node = document.createTextNode(value);
	}

	if ( range.collapsed ) {
		range.insertNode(node);
		range.setStartAfter(node);
	} else {
		range.deleteContents();
		range.insertNode(node);
		range.setStartBefore(node);
		range.setEndAfter(node);
	}
}
