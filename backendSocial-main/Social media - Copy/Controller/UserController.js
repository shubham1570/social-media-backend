import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json({
        success: true,
        message: "user found",
        otherDetails,
      });
    } else {
      res.status(500).json("user not found");
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "user not found",
    });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password, ...updateData } =
    req.body;

  // Check if current user admin status and ID are provided
  if (!currentUserAdminStatus || !currentUserId) {
    return res.status(400).json({
      success: false,
      message: "Please provide both the current user's ID and admin status.",
    });
  }

  try {
    // Check if the current user is either the user being updated or an admin
    if (id === currentUserId || currentUserAdminStatus) {
      // Hash the password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      // Update the user
      const user = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        user,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this user.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not update user.",
      error: error.message,
    });
  }
};

export const deleteUser=async(req,res)=>{
  const id=req.params.id;
  const{currentUserId,currentUserAdminStatus}=req.body;
  if(currentUserId===id||currentUserAdminStatus){
    try {
      await UserModel.findByIdAndDelete(id)
      res.status(200).json({
        success:true,
        message:"User deleted successfully"
      })
    } catch (error) {
      res.status(500).json({
        status:false,
        message:error.message,
      })
    }
  }
  else{
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this user.",
    });
  }
}
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  if (currentUserId === id) {
    return res.status(403).json({
      success: false,
      message: "Action forbidden",
    });
  }

  try {
    const followUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(currentUserId);

    if (!followUser || !followingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!followUser.followers.includes(currentUserId)) {
      await followUser.updateOne({ $push: { followers: currentUserId } });
      await followingUser.updateOne({ $push: { following: id } });
      return res.status(200).json("User followed");
    } else {
      return res.status(400).json({
        success: false,
        message: "User already followed",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  try {
    const followUser = await UserModel.findById(id);
    const followingUser = await UserModel.findById(currentUserId);

    if (!followUser || !followingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (followUser.followers.includes(currentUserId)) {
      await followUser.updateOne({ $pull: { followers: currentUserId } });
      await followingUser.updateOne({ $pull: { following: id } });
      return res.status(200).json("User unfollowed");
    } else {
      return res.status(400).json({
        success: false,
        message: "User not followed",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
