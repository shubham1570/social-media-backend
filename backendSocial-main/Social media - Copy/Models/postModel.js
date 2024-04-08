import mongoose from "mongoose";

// Define the schema for a post
const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: String,
    likes: [],
    image: String,
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create a model named "posts" using the postSchema
const PostModel = mongoose.model("posts", postSchema);

export default PostModel; // Export the PostModel
