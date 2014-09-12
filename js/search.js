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

function form_onSubmit(evt) {
	evt.preventDefault();

	Images.getByTag(document.getElementById('search_tag').value, function(err, imgs) {
		if (err) {
			onerror(err);
			return;
		}

		results_renderImages(imgs);
	});
}

function image_onselect(evt) {
	var target = evt.target;
	while (target && !target.classList.contains('selectable-image')) {
		target = target.parentElement;
	}

	if ( !target ) {
		return;
	}

	switch (evt.type) {
	case 'keypress':
		if (evt.keyCode === 13) {
			// user pressed enter
			insertImage(target.children[0].src);
		}
		break;
	case 'click':
		insertImage(target.children[0].src);
		break;
	}
}

function insertImage(src) {
	if (!targetTab) {
		return;
	}

	chrome.tabs.sendMessage(targetTab, {
		action: 'insert_image',
		data: {
			img: {
				src: src
			}
		}
	}, function() {
		window.close();
	});
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
	el.appendChild(imgEl);
	imgEl.src = img.src;

	return el;
}

function onerror(err) {
	console.error(err);
}

window.addEventListener('load', init, false);
function init() {
	searchForm = document.getElementById('search');
	searchResults = document.getElementById('search-results');

	searchForm.addEventListener('submit', form_onSubmit, false);
	document.addEventListener('keypress', image_onselect, false);
	document.addEventListener('click', image_onselect, false);
}
