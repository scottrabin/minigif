/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var ManagementPage = React.createClass({
	getInitialState: function() {
		return {
			tags: [],
			searchTag: ""
		};
	},
	componentWillMount: function() {
		this.props.backgroundPage.Images.getTags(function(err, tags) {
			this.setState({ tags: tags })
		}.bind(this));
	},
	searchForTag: function(tag) {
		this.setState({
			searchTag: tag
		});
	},
	onImageSelected: function(evt, img) {
		this.setState({
			editing: img
		});
	},
	render: function() {
		return React.DOM.div(
			{
				className: 'management-page'
			},
			(this.state.editing ? ImageTagEditor({ img : this.state.editing }) : null),
			ImageSearch({
				Images: this.props.backgroundPage.Images,
				onClick: this.onImageSelected,
				searchTag: this.state.searchTag
			}),
			TagList({
				tags: this.state.tags,
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
