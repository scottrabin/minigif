import { map } from 'lodash';
import ImageStore from '../stores/image';
import * as imageActions from '../actions/images';

class ImageSearchFrame extends React.Component {
	constructor(props) {
		this.onKeyPress = this.onKeyPress.bind(this);
		this.onClick    = this.onClick.bind(this);
	}
	onKeyPress(evt) {
		if ( this.props.onKeyPress ) {
			this.props.onKeyPress( evt, this.props.image );
		}
	}
	onClick(evt) {
		if ( this.props.onClick ) {
			this.props.onClick( evt, this.props.image );
		}
	}
	render() {
		return (
			<div className="imagesearch--imgframe">
				<img
					src={this.props.image.src}
					tabIndex={this.props.tabIndex}
					onKeyPress={this.onKeyPress}
					onClick={this.onClick} />
			</div>
		);
	}
}

class ImageSearch extends React.Component {
	constructor(props) {
		this.onChange        = this.onChange.bind(this);
		this.updateSearchTag = this.updateSearchTag.bind(this);

		this.state = {
			searchTag: props.searchTag || ""
		};
	}
	componentWillMount() {
		ImageStore.addListener('change', this.onChange);
	}
	componentWillUnmount() {
		ImageStore.removeListener('change', this.onChange);
	}
	componentWillReceiveProps(nextProps) {
		if ( nextProps.searchTag && this.props.searchTag !== nextProps.searchTag ) {
			this.setSearchTag( nextProps.searchTag );
		}
	}
	onChange() {
		this.forceUpdate();
	}
	setSearchTag(tag) {
		imageActions.FetchImagesMatchingTag( tag );

		this.setState({
			searchTag: tag
		});
	}
	updateSearchTag(evt) {
		if ( evt.type === 'submit' ) {
			evt.preventDefault();
		}

		this.setSearchTag( React.findDOMNode(this.refs.tagFilter).value );
	}
	renderImageFrame(image, tabIndex) {
		return (
			<ImageSearchFrame
				image={image}
				tabIndex={tabIndex}
				onKeyPress={this.props.onKeyPress}
				onClick={this.props.onClick} />
		);
	}
	render() {
		let tabIndex = 1;

		return (
			<form className="imagesearch" onSubmit={this.updateSearchTag}>
				<div className="form-row">
					<input
						type="text"
						ref="tagFilter"
						placeholder="Filter images by tag..."
						value={this.state.searchTag}
						tabIndex={tabIndex++}
						onChange={this.updateSearchTag} />
					<button type="submit">Filter</button>
				</div>
				<div className="imagesearch--container">
					{map(ImageStore.images,
						 (image, index) => this.renderImageFrame(image, ++tabIndex + index))}
				</div>
			</form>
		);
	}
}

export default ImageSearch;
