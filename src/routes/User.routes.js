import { Router } from "express"; 
import { LoginUser,
     Logout, 
     registerUser, 
     refrehAccessToken, 
     changeCurrentPassword, 
     getCurrentUser, 
     updateUserAccount, 
     updateUserAvatr, 
     updateCoverImage, 
     getUserChannelProfile, 
     getWatchHistory } from "../controllers/User.Controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";

const router = Router()
 // give response for user register and file upload

 router.route("/register").post (
    upload.fields([ // middlewares inject
        {
            name:"avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

    router.route("/login").post(LoginUser)
    // secured route
    router.route("/Logout").post( verifyJWT,Logout)
    // token
    router.route("/refresh-token").post(refrehAccessToken)
    router.route("/change-password").post(verifyJWT, changeCurrentPassword)
    router.route("/current-user").get(verifyJWT, getCurrentUser)
    router.route("/update-account").patch(verifyJWT,updateUserAccount)
    router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatr)
    router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

    router.route("/username").get(verifyJWT, getUserChannelProfile)
    router.route("/history").get(verifyJWT, getWatchHistory)

export default router