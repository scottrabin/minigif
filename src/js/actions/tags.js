import MiniDispatcher from '../dispatcher';
import * as Tags from '../db/tags';

export const SET_TAGS = 'set tags';

/**
 * Fetch all of the tags available in the database
 */
export function FetchTags() {
	Tags.getTags(function(error, tags) {
		if ( error ) {
			console.error( error );
		} else {
			MiniDispatcher.dispatch({
				type: SET_TAGS,
				data: {
					tags: tags
				}
			});
		}
	});
}
