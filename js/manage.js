/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

window.addEventListener('load', function init() {
	var bgPage = chrome.extension.getBackgroundPage();

	React.renderComponent(ImageSearch({
		Images: bgPage.Images
	}), document.getElementById('image-search'));

}, false);
