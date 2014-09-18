/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var SelectableTag = React.createClass({
	onSelectTag: function(evt) {
		evt.preventDefault();

		if ( this.props.onSelectTag ) {
			this.props.onSelectTag( this.props.tag );
		}
	},
	render: function() {
		return React.DOM.a(
			{
				href: '#',
				onClick: this.onSelectTag
			},
			this.props.tag
		);
	}
});

var TagList = React.createClass({
	propTypes: {
		tags:        React.PropTypes.array.isRequired,
		onSelectTag: React.PropTypes.func
	},
	render: function() {
		return React.DOM.ul(
			{
				className: 'taglist'
			},
			this.props.tags.map(function(tag) {
				return React.DOM.li(
					{
						key: tag
					},
					SelectableTag({
						tag:         tag,
						onSelectTag: this.props.onSelectTag
					})
				);
			}, this)
		);
	}
});
