import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";


export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);
  try {
    await newPost.save(); // Corrected: It should be newPost.save() instead of PostModel.save()
    res.status(200).json({
      success: true,
      message: "Post created",
      newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id; // Extracting the post ID from the request parameters

  try {
    // Attempting to find the post by its ID
    const post = await PostModel.findById(id);

    // If the post is found, sending a success response with the post data
    res.status(200).json({
      success: true,
      message: "Got the post",
      post,
    });
  } catch (error) {
    // If an error occurs during the process, sending an error response
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePost=async(req,res)=>{
  const postId=req.params.id;
  const {userId}=req.params.id;
  try {
    const post=await PostModel.findById(postId);
    if(post.userId===userId){
      await post.updateOne({$set:req.body})
      res.status(200).json("post updated")
    }
    else{
      res.status(403).json("action forbidden");
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}

export const deletePost=async(req,res)=>{
  const id =req.params.id;
  const {userId}=req.body;
  try {
    const post=await PostModel.findById(id);
    if(post.userId===userId){
      await post.deleteOne();
      res.status(200).json({
        success:true,
        message:"deleted"
      })
    }else{
       res.status(403).json("action forbidden")
    }
  } catch (error) {
    res.status(500).json({
      success:true,
      message:error.message
    })
  }
}
export const likePost=async(req,res)=>{
  const id=req.params.id;
const {userId}=req.body;
try {
  const post =await PostModel.findById(id);
  if(!post.likes.includes(userId)){
    await post.updateOne({$push:{likes:userId}})
    res.status(200).json("post liked")
  }
  else{
     await post.updateOne({ $pull: { likes: userId } });
     res.status(200).json("post unliked");
  }
} catch (error) {
  res.status(500).json({
    success:false,
    error
  })
}
}

 export const getTimelinePosts = async (req, res) => {
   const userId = req.params.id;
   try {
     const currentUserPosts = await PostModel.find({ userId: userId });

     const followingPosts = await UserModel.aggregate([
       {
         $match: {
           _id: new mongoose.Types.ObjectId(userId),
         },
       },
       {
         $lookup: {
           from: "posts",
           localField: "following",
           foreignField: "userId",
           as: "followingPosts",
         },
       },
       {
         $project: {
           followingPosts: 1,
           _id: 0,
         },
       },
     ]);

     const timelinePosts = currentUserPosts.concat(
       ...(followingPosts[0]?.followingPosts || [])
     );
     const sortedPosts = timelinePosts.sort(
       (a, b) => b.createdAt - a.createdAt
     );

     res.status(200).json(sortedPosts);
   } catch (error) {
     res.status(500).json({ success: false, message: error.message });
   }
 };
