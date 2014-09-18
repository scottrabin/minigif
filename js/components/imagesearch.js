/*!
 * @license
 * Copyright (c) 2014 Scott Rabin
 * See the LICENSE file in the repository root for the full license governing this code
 */

var ImageSearchImage = React.createClass({
	onKeyPress: function(evt) {
		this.props.onKeyPress(evt, this.props.img);
	},
	onClick: function(evt) {
		this.props.onClick(evt, this.props.img);
	},
	render: function() {
		var attrs = {};
		attrs.src = this.props.img.src;

		if ( this.props.tabIndex ) {
			attrs.tabIndex = this.props.tabIndex;
		}
		if ( this.props.onKeyPress ) {
			attrs.onKeyPress = this.onKeyPress;
		}
		if ( this.props.onClick ) {
			attrs.onClick = this.onClick;
		}

		return React.DOM.img(attrs);
	}
});

var ImageSearch = React.createClass({
	getInitialState: function() {
		return {
			searchTag: this.props.searchTag || "",
			imgs: []
		};
	},
	componentWillReceiveProps: function(nextProps) {
		if ( nextProps.searchTag && this.props.searchTag !== nextProps.searchTag ) {
			this.setState({
				searchTag: nextProps.searchTag
			});
		}
	},
	componentDidUpdate: function(prevProps, prevState) {
		if ( prevState.searchTag !== this.state.searchTag ) {
			this.props.Images.getByTag( this.state.searchTag, this.updateImages );
		}
	},
	updateSearchTag: function(evt) {
		if ( evt.type === 'submit' ) {
			evt.preventDefault();
		}

		this.setState({
			searchTag: this.refs.tagFilter.getDOMNode().value
		});
	},
	updateImages: function(err, imgs) {
		if ( err ) {
			console.error( err );
			imgs = [];
		}

		this.setState({
			imgs: imgs
		});
	},
	render: function() {
		var tabIndex = 1;

		return React.DOM.form(
			{
				className: 'imagesearch',
				onSubmit:  this.updateSearchTag,
			},
			React.DOM.div(
				{
					className: 'form-row'
				},
				React.DOM.input({
					type:        'text',
					ref:         'tagFilter',
					placeholder: "Filter images by tag...",
					value:       this.state.searchTag,
					tabIndex:    tabIndex++,
					onChange:    this.updateSearchTag
				}),
				React.DOM.button({
					type: 'submit'
				}, "Filter")
			),
			React.DOM.div(
				{
					className: 'imagesearch--container'
				},
				this.state.imgs.map(function(img) {
					return React.DOM.div(
						{
							key:       img.src,
							className: 'imagesearch--imgframe'
						}, ImageSearchImage({
							img:        img,
							tabIndex:   tabIndex++,
							onKeyPress: this.props.onKeyPress,
							onClick:    this.props.onClick
						})
					);
				}, this)
			)
		);
	}
});
