/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var Images = chrome.extension.getBackgroundPage().Images;
var searchForm, searchResults;

function form_onSubmit(evt) {
	evt.preventDefault();

	Images.getRange(0, 100, function(err, imgs) {
		if (err) {
			onerror(err);
			return;
		}

		results_renderImages(imgs);
	});
}

function results_renderImages(imgs) {
	while (searchResults.firstChild) {
		searchResults.removeChild(searchResults.lastChild);
	}
	var frag = document.createDocumentFragment();
	imgs.map(toSelectableImage).forEach(function(el) {
		frag.appendChild(el);
	});

	searchResults.appendChild(frag);
};

function toSelectableImage(imgSrc) {
	var el = document.createElement('div');
	var img = new Image();

	el.appendChild(img);
	img.src = imgSrc;

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
}
