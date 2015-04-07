import { findIndex } from 'lodash';
import { EventEmitter } from 'events';
import MiniDispatcher from '../dispatcher';
import * as imageActions from '../actions/images';

/**
 * Store for images; contains an array of images and responds to events that
 * modify those images
 * @class
 */
export class ImageStore extends EventEmitter {
	constructor() {
		this.images = {};
	}
	handleAction(action) {
		console.log("image store # handleAction %o", action);
		switch ( action.type ) {
		case imageActions.ADD_IMAGE:
			this.images[ action.data.image.src ] = action.data.image;
			break;
		case imageActions.UPDATE_IMAGE:
			this.images[ action.data.image.src ] = action.data.image;
			break;
		case imageActions.SET_IMAGES:
			this.images = action.data.images.reduce(function(m, image) {
				m[ image.src ] = image;
				return m;
			}, {});
			break;
		default:
			return;
		}

		this.emit('change');
	}
}

/** @const ImageStore */
let GlobalImageStore = new ImageStore();
MiniDispatcher.addStore(GlobalImageStore);
export default GlobalImageStore;
