import mongoose, {Schema, Types} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const likeSchema = new Schema(
    {
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        video:{
            type: Schema.Types.ObjectId,
            ref:"Video"
        },
        likedBY:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        }
    },{timestamps: true}
)
export const like = mongoose.model("Like", likeSchema)