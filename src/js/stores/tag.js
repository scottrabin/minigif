import { EventEmitter } from 'events';
import MiniDispatcher from '../dispatcher';
import * as tagActions from '../actions/tags';

export class TagStore extends EventEmitter {
	constructor() {
		this.tags = {};
	}
	handleAction(action) {
		switch (action.type) {
		case tagActions.SET_TAGS:
			this.tags = action.data.tags;
			break;
		default:
			return;
		}

		this.emit('change');
	}
}

/** @const TagStore */
let GlobalTagStore = new TagStore();
MiniDispatcher.addStore(GlobalTagStore);
export default GlobalTagStore;
