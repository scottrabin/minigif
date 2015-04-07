import { isEqual } from 'lodash';
import MiniDispatcher from '../dispatcher';
import * as Images from '../db/images';

export const ADD_IMAGE    = 'add image';
export const UPDATE_IMAGE = 'update image';
export const SET_IMAGES   = 'set images';

/**
 * Add an image to the database
 *
 * @param {Images.MiniImage} image
 */
export function AddImage(image) {
	MiniDispatcher.dispatch({
		type: ADD_IMAGE,
		data: {
			image: image
		}
	});
}

/**
 * Update an image in the database to match the given image
 *
 * @param {Images.MiniImage} image
 */
export function UpdateImage(image) {
	MiniDispatcher.dispatch({
		type: UPDATE_IMAGE,
		data: {
			image: image
		}
	});

	Images.save(image, function(error, savedImage) {
		if ( error ) {
			console.error( error );
		} else {
			if ( !isEqual(image, savedImage) ) {
				MiniDispatcher.dispatch({
					type: UPDATE_IMAGE,
					data: {
						image: savedImage
					}
				});
			}
		}
	});
}

/**
 * Attempt to fetch an image by src, and if it does not exist, create one.
 * Mainly used for the "add image" flow.
 *
 * @param {string} imageSrc
 */
export function ForceImage(imageSrc) {
	Images.getBySrc(imageSrc, function(err, image) {
		if (err) {
			console.error(err);
		} else if (image) {
			MiniDispatcher.dispatch({
				type: UPDATE_IMAGE,
				data: {
					image: image
				}
			});
		} else {
			AddImage(new Images.MiniImage(imageSrc, []));
		}
	});
}

/**
 * Fetch all images matching a specific tag (exact match)
 *
 * @param {string} tag
 */
export function FetchImagesByTag(tag) {
	Images.getByTag(tag, function(error, images) {
		if ( error ) {
			console.error( error );
		} else {
			MiniDispatcher.dispatch({
				type: SET_IMAGES,
				data: {
					images: images
				}
			});
		}
	});
}

/**
 * Fetch all images matching a partial tag
 *
 * @param {string} tag
 */
export function FetchImagesMatchingTag(tag) {
	Images.getByTagPartial(tag, function(error, images) {
		if ( error ) {
			console.error( error );
		} else {
			MiniDispatcher.dispatch({
				type: SET_IMAGES,
				data: { images }
			});
		}
	});
}
