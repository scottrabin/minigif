import * as popupActions from './actions/popup';
import * as imageActions from './actions/images';
import MiniDispatcher from './dispatcher';
import { MiniImage } from './db/images';
import ImageStore from './stores/image';

// Wait for the message from the spawning process to configure this popup
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.type !== popupActions.CONFIGURE_NEW_IMAGE_WINDOW) {
		return;
	}

	imageActions.ForceImage(msg.data.image.src);
	React.render( <NewImagePage src={msg.data.image.src} />, document.body );
});

/**
 * App-level component for the Add New Image popup
 * @class
 */
class NewImagePage extends React.Component {
	constructor(props) {
		super(props)
		this.onStoreUpdated = this.onStoreUpdated.bind(this);
		this.state = {
			image: ImageStore.images[ this.props.src ]
		};
	}
	componentDidMount() {
		ImageStore.addListener('change', this.onStoreUpdated);
	}
	componentWillUnmount() {
		ImageStore.removeListener('change', this.onStoreUpdated);
	}
	onStoreUpdated() {
		this.setState({
			image: ImageStore.images[ this.props.src ]
		});
	}
	onSubmit(event) {
		event.preventDefault();

		let oldImage = ImageStore.images[ this.props.src ];
		if ( !oldImage ) {
			return;
		}

		let newTags  = new Set( oldImage.tags );
		newTags.add( React.findDOMNode(this.refs.newTag).value );
		let newImage = new MiniImage( oldImage.src, newTags );
		imageActions.UpdateImage( newImage );
	}
	render() {
		var image = ImageStore.images[ this.props.src ] || MiniImage.EMPTY;

		return (
			<div id="modal-background">
				<form onSubmit={this.onSubmit.bind(this)}>
					<img src={image.src} />
					<input autofocus
					       ref="newTag"
						   placeholder="Add new tags to your image!" />
					<ul>
						{image.toJSON().tags.map(function(tag) {
							return <li>{tag}</li>;
						})}
					</ul>
					<button>Add to Collection</button>
				</form>
			</div>
		);
	}
}

React.render( <NewImagePage src={null} />, document.body );
