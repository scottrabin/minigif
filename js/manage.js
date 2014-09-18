/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var ManagementPage = React.createClass({
	getInitialState: function() {
		return {
			searchTag: ""
		};
	},
	searchForTag: function(tag) {
		this.setState({
			searchTag: tag
		});
	},
	render: function() {
		return React.DOM.div(
			{
				className: 'management-page'
			},
			ImageSearch({
				Images: this.props.backgroundPage.Images,
				searchTag: this.state.searchTag
			}),
			TagList({
				Images: this.props.backgroundPage.Images,
				onSelectTag: this.searchForTag
			})
		)
	}
})

window.addEventListener('load', function init() {
	React.renderComponent(ManagementPage({
		backgroundPage: chrome.extension.getBackgroundPage()
	}), document.body);
}, false);
