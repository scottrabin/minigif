import * as format from './constants/format_constants';
import ImageSearch from './components/imagesearch';
import * as popupActions from './actions/popup';

const KEYPRESS_FORMAT_MAP = {
	"Enter": format.FORMAT_AUTO,
	"c":     format.FORMAT_CLIPBOARD,
	"e":     format.FORMAT_EMBED,
	"h":     format.FORMAT_HTML,
	"m":     format.FORMAT_MARKDOWN,
	"r":     format.FORMAT_RAW
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if ( msg.type !== popupActions.CONFIGURE_SELECT_IMAGE_WINDOW ) {
		return;
	}

	React.render( <SearchPage targetTabId={msg.data.tabId} />, document.body );
});

class SearchPage extends React.Component {
	constructor(props) {
		this.onClick    = this.onClick.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
	}
	insertImage(image, format) {
		chrome.tabs.sendMessage(this.props.targetTabId, {
			type: 'insert_image', // TODO
			data: {
				format: format,
				image:  image
			}
		}, function() {
			window.close();
		});
	}
	onKeyPress(evt, image) {
		let format = KEYPRESS_FORMAT_MAP[ evt.key ];
		if ( format ) {
			this.insertImage( image, format );
		}
	}
	onClick(evt, image) {
		this.insertImage( image, KEYPRESS_FORMAT_MAP["Enter"] );
	}
	render() {
		return (
			<ImageSearch
				onKeyPress={this.onKeyPress}
				onClick={this.onClick} />
		);
	}
}

React.render( <SearchPage targetTabId={null} />, document.body );
