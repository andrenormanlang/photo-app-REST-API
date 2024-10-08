"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.update = exports.removePhoto = exports.addPhotosToAlbum = exports.store = exports.show = exports.index = void 0;
/**
 *
 * Photos Controller
 */
const debug_1 = __importDefault(require("debug"));
const express_validator_1 = require("express-validator");
const album_service_1 = require("../services/album_service");
const http_errors_1 = require("http-errors");
// Create a new debug instance
const debug = (0, debug_1.default)('prisma-foto-api:photos_controller');
/**
 * Get all albums from the logged in user
 */
const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = Number(req.token.sub);
    try {
        const albums = yield (0, album_service_1.getAlbums)(user_id);
        res.send({
            status: "success",
            data: albums,
        });
    }
    catch (err) {
        console.log("Error thrown when finding albums with id %o: %o", err);
        res.status(500).send({ status: "error", message: "Something went wrong" });
    }
});
exports.index = index;
const show = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const albumId = Number(req.params.albumId);
    const user_id = Number(req.token.sub);
    try {
        const album = yield (0, album_service_1.getAlbum)(albumId);
        if (!album) {
            return res.status(404).send({
                status: "fail",
                message: "Album not found"
            });
        }
        if (album.user_id !== user_id) {
            return res.status(403).send({
                status: "fail",
                message: "Not authorized to access this album"
            });
        }
        const photos = album.photos.map((photo) => ({
            id: photo.id,
            title: photo.title,
            url: photo.url,
            comment: photo.comment,
            user_id: photo.user_id
        }));
        return res.status(200).send({
            status: "success",
            data: {
                id: album.id,
                title: album.title,
                user_id: album.user_id,
                photos: photos
            }
        });
    }
    catch (err) {
        debug("Error thrown when finding photo with id %o: %o", req.params.photoId, err);
        return res.status(500).send({
            status: 'error',
            message: 'Could not get the album'
        });
    }
});
exports.show = show;
/**
 * Create a album
 */
const store = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = (0, express_validator_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).send({
            status: "fail",
            data: validationErrors.array()
        });
    }
    const { title } = req.body;
    try {
        const album = yield (0, album_service_1.createAlbum)({
            title,
            user_id: Number(req.token.sub),
        });
        res.status(201).send({
            status: "success",
            data: album,
        });
    }
    catch (err) {
        res.status(500).send({
            status: "error",
            message: "Could not create album in database",
        });
    }
});
exports.store = store;
/**
 * Add a photo to a album
 */
// export const addPhotoToAlbum = async (req: Request, res: Response) => {
// 	const albumId = Number(req.params.albumId);
// 	const photoId = Number(req.body.photo_id);
// 	const userId = Number(req.token!.sub);
// 	try {
// 	  await addPhoto(albumId, photoId, userId);
// 	  return res.status(200).send({
// 		status: 'success',
// 		data: null,
// 	  });
// 	} catch (err: any) {
// 	  console.error(err);
// 	  if (err.message === 'Album not found' || err.message === 'Photo not found') {
// 		return res.status(404).send({
// 		  status: 'fail',
// 		  message: err.message,
// 		});
// 	  }
// 	  if (err.message === 'Not authorized to access this album' || err.message === 'You do not have permission to add this photo to the album') {
// 		return res.status(403).send({
// 		  status: 'fail',
// 		  message: err.message,
// 		});
// 	  }
// 	  return res.status(500).send({
// 		status: 'error',
// 		message: 'Could not add photo to album',
// 	  });
// 	}
//   };
/**
 * Add multiple photos to a album
 */
const addPhotosToAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = (0, express_validator_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).send({
            status: "fail",
            data: validationErrors.array()
        });
    }
    try {
        const albumId = Number(req.params.albumId);
        const photoIds = req.body.photo_id;
        if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid photo_id parameter in request body",
            });
        }
        const invalidIds = photoIds.filter(id => isNaN(Number(id)));
        if (invalidIds.length > 0) {
            return res.status(400).send({
                status: "fail",
                message: "Invalid photo_id parameter in request body",
            });
        }
        const user_id = Number(req.token.sub);
        yield (0, album_service_1.addPhotos)(albumId, photoIds.map(id => Number(id)), user_id);
        return res.status(200).send({
            status: "success",
            data: null,
        });
    }
    catch (err) {
        if (err instanceof http_errors_1.NotFound) {
            return res.status(404).send({
                status: "error",
                message: err.message,
            });
        }
        else if (err instanceof http_errors_1.Forbidden) {
            return res.status(403).send({
                status: "error",
                message: err.message,
            });
        }
        else {
            return res.status(500).send({
                status: "error",
                message: "Internal Server Error",
            });
        }
    }
});
exports.addPhotosToAlbum = addPhotosToAlbum;
/**
 * Remove a photo from a album
 */
const removePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const albumId = Number(req.params.albumId);
    const photoId = Number(req.params.photoId);
    const userId = Number(req.token.sub);
    try {
        const album = yield (0, album_service_1.getAlbumUser)(albumId);
        if (!album) {
            return res.status(404).send({
                status: 'fail',
                message: 'Album not found',
            });
        }
        if (album.user.id !== userId) {
            return res.status(403).send({
                status: 'fail',
                message: 'Not authorized to access this album',
            });
        }
        yield (0, album_service_1.removePhotoFromAlbum)(albumId, photoId);
        return res.status(200).send({
            status: 'success',
            data: null,
        });
    }
    catch (err) {
        console.error(err);
        if (err.message === 'Album not found' || err.message === 'Photo not found') {
            return res.status(404).send({
                status: 'fail',
                message: err.message,
            });
        }
        return res.status(500).send({
            status: 'error',
            message: 'Could not remove photo from album',
        });
    }
});
exports.removePhoto = removePhoto;
/**
 * Update a album
 */
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = (0, express_validator_1.validationResult)(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).send({
            status: "fail",
            data: validationErrors.array()
        });
    }
    const albumId = Number(req.params.albumId);
    const user_id = Number(req.token.sub);
    try {
        let album = yield (0, album_service_1.getAlbum)(albumId);
        if (!album) {
            return res.status(404).send({
                status: "fail",
                message: "Album not found",
            });
        }
        if (album.user_id !== user_id) {
            return res.status(403).send({
                status: "fail",
                message: "Not authorized to access this album",
            });
        }
        album = yield (0, album_service_1.updateAlbum)(albumId, req.body);
        return res.status(200).send({
            status: "success",
            data: {
                title: album === null || album === void 0 ? void 0 : album.title,
                user_id: user_id,
                id: album === null || album === void 0 ? void 0 : album.id
            },
        });
    }
    catch (err) {
        return res.status(500).send({
            status: "error",
            message: "Could not update the album",
        });
    }
});
exports.update = update;
/**
 * Delete an album
 * Obs: Delete an album (including the links to photos but not the photos themselves)
 */
const destroy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const albumId = Number(req.params.albumId);
    const user_id = Number(req.token.sub);
    try {
        const album = yield (0, album_service_1.getAlbum)(albumId);
        if (!album) {
            return res.status(404).send({
                status: 'fail',
                message: 'Album not found',
            });
        }
        if (album.user_id !== user_id) {
            return res.status(403).send({
                status: 'fail',
                message: 'Not authorized to access this album',
            });
        }
        // Delete the album
        yield (0, album_service_1.deleteAlbum)(albumId);
        return res.status(200).send({
            status: 'success',
            data: null,
        });
    }
    catch (err) {
        debug('Error thrown when finding album with id %o: %o', req.params.albumId, err);
        return res.status(500).send({
            status: 'error',
            message: 'Could not delete the album',
        });
    }
});
exports.destroy = destroy;
