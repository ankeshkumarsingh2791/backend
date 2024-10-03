import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import {extractPublicId} from "cloudinary-build-url"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const deleteInCloudinary = async(localFilePath) => {
  try {
      if(!localFilePath) {
          return null
      }
  
      const publishId = extractPublicId(localFilePath)
      if(!publishId){
          return null
      }
  
      let resource_type = "image"
      if(localFilePath.match(/\.(mp4|mkv|mov|avi)$/)){
          resource_type = "video"
      }
      else if (fileUrl.match(/\.(mp3|wav)$/)) {
          resource_type = "raw"; // For audio or other file types
      }
  
      const response = await cloudinary.uploader.destroy(publishId, {resource_type:resource_type})
           return response;
  } catch (error) {
    return null;
    
  }
}


export {uploadOnCloudinary, deleteInCloudinary}