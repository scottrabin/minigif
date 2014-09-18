/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var ImageTagEditor = React.createClass({
	getInitialState: function() {
		return {
			img: this.props.img,
			tempTags: []
		};
	},
	componentWillReceiveProps: function(nextProps) {
		if ( nextProps.img ) {
			this.setState( { img: nextProps.img } );
		}
	},
	updateTags: function(evt) {
		if ( evt.key === 'Enter' ) {
			var temptag = this.refs.tag.getDOMNode().value;

			this.setState({
				tempTags: this.state.tempTags.concat(temptag)
			});

			chrome.extension.getBackgroundPage().Images.save(
				this.state.img.src,
				this.state.img.tags.concat( temptag ),
				function(err, img) {
					if ( err ) {
						console.error( err );
						return;
					}

					var nextState = {
						img: img
					};
					var tempTagIndex = this.state.tempTags.indexOf( temptag );
					if ( tempTagIndex > -1 ) {
						nextState.tempTags = this.state.tempTags.slice(0);
						nextState.tempTags.splice( tempTagIndex, 1 );
					}

					this.setState(nextState);
				}.bind(this)
			);
		}
	},
	removeTag: function(tag) {
		var tagIndex = this.state.img.tags.indexOf(tag);
		if ( tagIndex === -1 ) {
			return;
		}
		var tags = this.state.img.tags.slice(0);
		tags.splice(tagIndex, 1);

		chrome.extension.getBackgroundPage().Images.save(
			this.state.img.src,
			tags,
			function(err, img) {
				if ( err ) {
					console.error( err );
					return;
				}

				this.setState({
					img: img
				});
			}.bind(this)
		);
	},
	render: function() {
		return React.DOM.div(
			{
				className: 'imagetageditor'
			},
			React.DOM.img(
				{
					src: this.state.img.src
				}
			),
			React.DOM.input(
				{
					ref: 'tag',
					onKeyPress: this.updateTags
				}
			),
			TagList(
				{
					tags: this.state.img.tags,
					onSelectTag: this.removeTag
				}
			),
			TagList( { tags: this.state.tempTags } )
		);
	}
});
