/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var Images = chrome.extension.getBackgroundPage().Images;
var searchForm, searchResults;
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
 * @param {string} src
 * @param {string} format
 */
function insertImage(src, format) {
	if ( !targetTab ) {
		return;
	}

	chrome.tabs.sendMessage(targetTab, {
		action: 'insert_image',
		data: {
			format: format,
			img: {
				src: src
			}
		}
	}, function() {
		window.close();
	});
}
/**
 * Fetch the images matching the given partial tag and update the search results
 * with the matches
 *
 * @param {string} partialTag
 */
function updateSearch(partialTag) {
	Images.getByTag(partialTag, function(err, imgs) {
		if ( err ) {
			console.error(err);
			return;
		}

		results_renderImages( imgs );
	});
}

/**
 * EventHandler satisfies the EventHandler interface to be used as an object
 * in HTMLElement.addEventListener. It dispatches events to the nearest containing
 * element with a `data-on[type]` attribute's bound function, if one exists.
 */
var EventHandler = {};
EventHandler.handleEvent = function(evt) {
	var evtGroup = EventHandler.events[ evt.type ];
	if ( !evtGroup ) {
		return;
	}

	var target = evt.target;
	while ( target && !target.hasAttribute('data-on' + evt.type) ) {
		target = target.parentElement;
	}

	if ( !target ) {
		return;
	}

	var action = evtGroup[ target.getAttribute('data-on' + evt.type) ];
	if ( action ) {
		action( evt, target );
	}
}

EventHandler.events = {};

EventHandler.events.input = {};
EventHandler.events.input['update-search'] = function update_search_input(evt, target) {
	updateSearch( target.value );
};

EventHandler.events.keypress = {};
EventHandler.events.keypress['select-image'] = function select_image(evt, target) {
	switch ( evt.keyCode ) {
	case 13:
		// on enter, insert the source directly
		insertImage( target.children[0].src, 'raw' );
		break;

	case 99:
		// on `c`, copy img src to clipboard
		// TODO
		console.warn("Copy to clipboard not implemented");
		break;

	case 104:
		// on `h`, insert html
		insertImage( target.children[0].src, 'html' );
		break;

	case 109:
		// on `m`, insert markdown
		insertImage( target.children[0].src, 'markdown' );
		break;
	}
};

EventHandler.events.click = {};
EventHandler.events.click['select-image'] = function select_image_click(evt, target) {
	while ( target && !target.classList.contains('selectable-image') ) {
		target = target.parentElement;
	}

	if ( target ) {
		evt.preventDefault();
		insertImage( target.children[0].src );
	}
};

function form_onSubmit(evt) {
	evt.preventDefault();

	updateSearch( evt.target['search_tag'].value );
}

function results_renderImages(imgs) {
	while (searchResults.firstChild) {
		searchResults.removeChild(searchResults.lastChild);
	}
	var frag = document.createDocumentFragment();
	imgs.map(toSelectableImage).forEach(function(el) {
		frag.appendChild(el);
		el.tabIndex = frag.children.length + 1;
	});

	searchResults.appendChild(frag);
};

function toSelectableImage(img) {
	var el = document.createElement('div');
	var imgEl = new Image();

	el.classList.add('selectable-image');
	el.setAttribute('data-onkeypress', 'select-image');
	el.setAttribute('data-onclick', 'select-image')
	el.appendChild(imgEl);
	imgEl.src = img.src;

	return el;
}

window.addEventListener('load', function init() {
	searchForm = document.getElementById('search');
	searchResults = document.getElementById('search-results');

	searchForm.addEventListener('submit', form_onSubmit, false);
	Object.keys(EventHandler.events).forEach(function(evtName) {
		document.addEventListener(evtName, EventHandler, false);
	});
}, false);
