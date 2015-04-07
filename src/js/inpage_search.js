import * as format from './constants/format_constants';

var activeElement = document.activeElement;

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	// TODO
	if ( msg.type !== 'insert_image' || !activeElement ) {
		return;
	}

	let fmt      = getFormat( activeElement, msg.data.format );
	let contents = getInsertContents( activeElement, msg.data.image, fmt );
	insertImage( activeElement, contents );

	sendResponse();
});

/**
 * Gets the correct format for the given element
 *
 * @param {HTMLElement} element The element to consider for automatic formatting
 * @param {Format} fmt The requested format type for the image
 * @return {Format}
 */
function getFormat(element, fmt) {
	if ( fmt !== format.FORMAT_AUTO ) {
		return fmt;
	} else if ( element.isContentEditable ) {
		return format.FORMAT_EMBED;
	} else {
		return format.FORMAT_RAW;
	}
}

/**
 * Determine the content to insert into the given element based on the format
 * type and target element's properties
 *
 * @param {HTMLElement} element
 * @param {MiniImage} image
 * @param {Format} fmt
 * @return {string|HTMLElement} the content to insert
 */
function getInsertContents(element, image, fmt) {
	switch ( fmt ) {
	case format.FORMAT_RAW:
		return image.src;

	case format.FORMAT_MARKDOWN:
		return "[" + image.src + "](" + image.src + ")";

	case format.FORMAT_EMBED:
	case format.FORMAT_HTML:
		let imageElement = document.createElement( 'img' );
		imageElement.setAttribute( 'src', image.src );

		if ( fmt === format.FORMAT_HTML || !activeElement.isContentEditable ) {
			return imageElement.outerHTML;
		} else {
			return imageElement;
		}

	default:
		console.error( "Unknown image insertion format: %s", fmt );
		return "";
	}
}

function insertImage(element, value) {
	var changeEvt = new Event('change', {
		'bubbles':    true,
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

	selection.removeAllRanges();
	selection.addRange(range);
}
