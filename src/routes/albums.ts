/**
 * Router Template
 */
import express from 'express'
import { index, show, store, update, destroy, addPhotosToAlbum, removePhoto } from '../controllers/albums_controller'
import { createAlbumRules, updateAlbumRules  } from '../validations/album_rules'

const router = express.Router()

/**
 * GET /resource
 */
router.get('/', index)

/**
 * GET /resource/:resourceId
 */
router.get('/:albumId', show)

/**
 * POST /resource
 */
router.post('/', createAlbumRules, store)

/**
 * POST /resource
 */
router.post('/:albumId/photos', addPhotosToAlbum)

/**
 * POST /resource
 */
router.delete('/:albumId/photos/:photoId', removePhoto)


/**
 * PATCH /resource/:resourceId
 */
router.patch('/:albumId', updateAlbumRules, update)

/**
 * DELETE /resource/:resourceId
 */
router.delete('/:albumId', destroy)

export default router
