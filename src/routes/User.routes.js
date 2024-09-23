import { Router } from "express"; 
import { registerUser } from "../controllers/User.Controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router