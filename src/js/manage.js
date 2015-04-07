import { map } from 'lodash';
import ImageStore from './stores/image';
import TagStore from './stores/tag';
import ImageSearch from './components/imagesearch';
import * as tagActions from './actions/tags';
import * as imageActions from './actions/images';

class ManagementPage extends React.Component {
	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.state = {
			selectedTag: null
		};
	}
	componentWillMount() {
		ImageStore.addListener('change', this.onChange);
		TagStore.addListener('change', this.onChange);
	}
	componentWillUnmount() {
		ImageStore.removeListener('change', this.onChange);
		TagStore.removeListener('change', this.onChange);
	}
	onChange(_) {
		this.forceUpdate();
	}
	showImagesByTag(tag) {
		imageActions.FetchImagesByTag(tag);

		this.setState({
			selectedTag: tag
		});
	}
	renderTagLink(count, tag) {
		return (
			<li>
				<a
					href="#{tag}"
					onClick={this.showImagesByTag.bind(this, tag)}>{tag} ({count})</a>
			</li>
		);
	}
	renderMatchingImages() {
		if ( this.state.selectedTag ) {
			return (
				<ul>
					{map(ImageStore.images, (image) => <img src={image.src} />)}
				</ul>
			);
		}
	}
	render() {
		return (
			<div className="management-page">
				<ul className="taglist">{map(TagStore.tags, this.renderTagLink, this)}</ul>
				<ImageSearch />
			</div>
		);
	}
}

React.render( <ManagementPage />, document.body );

tagActions.FetchTags();
