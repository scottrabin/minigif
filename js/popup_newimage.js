/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	var tagform    = document.getElementById('newimage');
	var taginput   = document.getElementById('tags_tag');
	var imgelement = document.getElementById('image');
	var tagslist   = document.getElementById('tags');
	var tags = [];

	imgelement.src = msg.imgSrc;

	tagform.addEventListener('submit', function(evt) {
		evt.preventDefault();

		if (taginput.value.length > 0) {
			tags.push(taginput.value);
			tagslist.appendChild(createTagElement(taginput.value));
			taginput.value = "";
		} else {
			chrome.runtime.sendMessage({
				action: "add_image",
				data: {
					imgSrc: msg.imgSrc,
					tags:   tags
				}
			}, function(img) {
				chrome.windows.getCurrent(function(win) {
					chrome.windows.remove(win.id);
				});
			});
		}
	});
});

function createTagElement(tag) {
	var el = document.createElement('li');
	el.textContent = tag;

	return el;
}
