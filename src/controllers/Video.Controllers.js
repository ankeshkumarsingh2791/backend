import {assyncHandler} from "../utils/assyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {Video} from "../models/video.model.js"
import mongoose from "mongoose"
import jwt from " jsonwebtoken"
import {uploadOnCloudinary, deleteInCloudinary} from "../utils/cloudinary.js"


const publishVideo = assyncHandler(async(req, res) => {
    try{

    // get video, upload to cloudinary, create video
     const {title, description} = req.body;
        if(!title || !description){
            throw new apiError(400, "tile and description required")
        }
      // get video file 
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if(!videoFileLocalPath){
        throw new apiError(400, "video file not found")
    } 
    // upload video file on cloudinary

    const uploadVideoFile = await uploadOnCloudinary(videoFileLocalPath)
    if(!uploadVideoFile.url){
        throw new apiError(400, "Video file not uploaded successfully")
    }   

    const thumbnailLocalPath = req.files?.thumbnail[0].path

    if(!thumbnailLocalPath){
        throw new apiError(400, "Thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
        throw new apiError(400, "Error while uploading thumbnail file")

    }

    const saveVideo = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        title,
        description,
        duration:videoFile.duration,
        owner:req.User?._id
    })

    if(!saveVideo){
        throw new apiError (400, "Error while saving video")
    }

    return res.status(201).json(
        new apiResponse(200, saveVideo, " Video Uploaded successfully ")
    )
    }
    catch(error){
         throw new apiError(400,error?.message || "Error While uploading file")
    }
       
})

const getAllVideo = assyncHandler(async(req, res) => {
    //  get all video based on query , sort , pagination
    const{ query, sortBy, sortType, page=1, limit=10, userId} = req.query

    const video = await Video.aggregate([{
        $match:{
            $or:[
                {title:{$regex:query, $options:"i"}},
                {description:{$regex:query,$options:"i"}}

            ]
        }
    },
    {
        $lookup:{
            from:"User",
            localField:"owner",
            foreignField:"_id",
            as:"createdBy"
        }
    },
    {
      $unwind:"$createBy"  
    },
    {
        $project:{
            thumbnail:1,
            videoFile:1,
            title:1,
            description:1,
            createdBy:{
                fulName:1,
                username:1,
                avatar:1
            }
        }
    },{
        $sort:{
            [sortBy]:sortType === "asc" ? 1:-1
        }
    },
    {
        $skip:(page-1)*limit
    },
    {
        $limit: parseInt(limit)
    }
       
    ])

    return res.status(200)
    .json(
        new apiResponse(200, {video}, "All videos")
    )
})

const getVideoById = assyncHandler(async(req, res) =>{
    
    try {
    const {videoId} = req.params
      if(!videoId){
        throw new apiError(400, "video id required to get details of video")
      } 
      
      const video = await Video.findById(videoId)
      if(!video){
        throw new apiError(400, "Video file not found ")
      }

      return res.status(200)
      .json(
        new apiResponse(200, {video}, "video sent successfully")
      )
    } catch (error) {
      throw new apiError(400, error?.message || "error while fetching video")  
        
    }
})

const updateVideo = assyncHandler(async(req, res) => {
    try {
        const {videId} = req.params
        if(!videId){
            throw new apiError(400, "video id not found")
        }
        const {title, description} = req.body
        if(!title || !description){
            throw new apiError(400, "Relate title and description not found")
        }

        const video = await Video.findById(videId)

        if(!(video?.owner !== req.User?._id)){
            throw new apiError(400, "You can not update the details")
        }

        const deleteOldThumbnail = await deleteInCloudinary(video.thumbnail)
        
        if(deleteOldThumbnail.result !== "ok"){
            throw new apiError(400, "previous thumbnail was not deleted")
        }

        const newThumbnailFile = req.file?.path

        if(!newThumbnailFile){
            throw new apiError(400, "new thumbnail not found")
        }

        const newThumbnail = await uploadOnCloudinary(newThumbnailFile)
        if(!newThumbnail){
            throw new apiError(400, "New thumbnail is not updated")
        }

        const videoUpdate = await Video.findByIdAndUpdate(
            videId,
            {
                $set:{
                    title,
                    description,
                    thumbnail:newThumbnail.url
                }
            },
            {
                new: true
            }
        )

        return res
        .status(200)
        .json(
            new apiResponse(200, videoUpdate, " Video updated successfully")
        )

    } catch (error) {
      throw new apiError(400, error?.message || "error while fetching video")  
    }
})

const deleteVideo = assyncHandler(async(req, res) => {
    try {
        const {videoId} = req.params

        if(!videoId){
            throw new apiError(400, "Video id is required")
        }

        const video = await Video.findById(videoId)
       if(!(video?.owner !== req.User?._id)){
        throw new apiError(400,"Video not found")
       }

       const videoDelete = await deleteInCloudinary(video.videoFile)
        if(videoDelete.result !== "ok"){
            throw new apiError(400, "Not abel to delete video")
        }

        const deleteThumbnail = await deleteInCloudinary(video.thumbnail)
         if(deleteThumbnail.result !== "ok"){
            throw new apiError(400, "not able to delete thumbnail")
         }

         const videoDeleted = await Video.findByIdAndDelete(videoId)
         return res.status(200)
         .json(
         new apiResponse (200, {deleteVideo}, "video deleted successfully")
         )

    } catch (error) {
       throw new apiError (400, error?.message || "Error during video deletion") 
    }
})


const togglePublishStatus = assyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId)
    if (!(video?.owner !== req.user?._id)) {
        throw new apiError(400,"You cannot Update the details")
    }
    const videoChanged = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!video.isPublished
            }
        },  
        {
            new:true
        }
    )
    return res
    .status(200)
    .json(new apiResponse(
        200,
        videoChanged,
        "Changed View of the Publication"
    ))
})



export {
    publishVideo,
    getAllVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}


