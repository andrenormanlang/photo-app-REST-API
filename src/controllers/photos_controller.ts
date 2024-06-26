/**
 * 
 * Photos Controller
 */
import Debug from 'debug'
import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { createPhoto, getPhotos, getPhoto, updatePhoto, deletePhoto } from '../services/photo_service'
import {HttpError} from  'http-errors'

// Create a new debug instance
const debug = Debug('prisma-foto-api:photos_controller')

/**
 * Get all photos
 */
export const index = async (req: Request, res: Response) => {
	const user_id = Number(req.token!.sub)
	const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        return res.status(400).send({
            status: "fail",
            data: validationErrors.array()
        })
    }

	try {
		const photos = await getPhotos(user_id)
	

		res.send({
			status: "success",
			data: photos,
		})

	} catch (err) {
		console.log("Error thrown when finding photos with id %o: %o", err)
		res.status(500).send({ status: "error", message: "Something went wrong" })
	}
}

export const show = async (req: Request, res: Response) => {

	const photoId = Number(req.params.photoId)

	const user_id = Number(req.token!.sub)

	try {
	const photo = await getPhoto(photoId);

	if (!photo) {
		return res.status(404).send({
		status: "fail",
		message: "Photo not found"
		});
	}

	if (photo.user_id !== user_id) {
		return res.status(403).send({
		status: "fail",
		message: "Not authorized to access this photo"
		});
	}

	return res.status(200).send({
		status: "success",
		data: {
		id: photo.id,
		title: photo.title,
		url: photo.url,
		comment: photo.comment
		}
	});

	} catch (err) {
	debug("Error thrown when finding photo with id %o: %o", req.params.photoId, err)
	return res.status(500).send({
		status: 'error',
		message: 'Could not get the photo'
	});
	}
};

/**
 * Create a photo
 */
export const store = async (req: Request, res: Response) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        return res.status(400).send({
            status: "fail",
            data: validationErrors.array()
        })
    }

    const { title, url, comment } = req.body

    try {
        const photo = await createPhoto({
            title,
            url,
            comment,
            user_id: Number(req.token!.sub),
        })

        res.status(201).send({
            status: "success",
            data: photo,
        })
    }
    catch (err) {
        res.status(500).send({
            status: "error",
            message: "Could not create photo in database",
        }) 
    }
}

export const update = async (req: Request, res: Response) => {
	const validationErrors = validationResult(req)
	if (!validationErrors.isEmpty()) {
	  return res.status(400).send({
		status: "fail",
		data: validationErrors.array()
	  })
	}
	const photoId = Number(req.params.photoId);
	const user_id = Number(req.token!.sub);
  
	try {
	  const photo = await updatePhoto(photoId, req.body, user_id);
	  return res.status(200).send({
		status: "success",
		data: {
		  id: photo.id,
		  title: photo.title,
		  url: photo.url,
		  comment: photo.comment,
		  user_id: user_id,
		},
	  });
	} 
	
	 catch (err) {
	  if(err instanceof HttpError) {
	  	
		return res.status(err.statusCode).send({
		status: "error",
		message: err.message,
		})}
	  else{
		return res.status(500)
	  } 
	}
};

/**
 * Delete a photo
 */
export const destroy = async (req: Request, res: Response) => {
	const validationErrors = validationResult(req)
	if (!validationErrors.isEmpty()) {
	  return res.status(400).send({
		status: "fail",
		data: validationErrors.array()
	  })
	}
	const photoId = Number(req.params.photoId);
	const user_id = Number(req.token!.sub)
  
	try {
		const photo = await deletePhoto(photoId, user_id);

		return res.status(200).send({
		status: "success",
		data: null,	
		});	
	} catch (err) {
		if(err instanceof HttpError) {
			
		return res.status(err.statusCode).send({
		status: "error",
		message: err.message,
		})}
		else{
		return res.status(500)
		} 
	}
};
	




