import { Router } from "express"; 
import { LoginUser, Logout, registerUser, refrehAccessToken } from "../controllers/User.Controller.js";
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

export default router