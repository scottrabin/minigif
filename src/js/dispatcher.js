import { Dispatcher } from 'flux';

class MiniDispatcher extends Dispatcher {
	addStore(store) {
		this.register(store.handleAction.bind(store));
	}
}

export default new MiniDispatcher();
