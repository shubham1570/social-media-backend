import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { username, password, firstname, lastname } = req.body;

    // Check if any required field is missing
    if (!username || !password || !firstname || !lastname) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details.",
      });
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
   
    // Create a new user instance
    const newUser = new UserModel({
      username,
      password:hashedPassword,
      firstname,
      lastname,
    });

    // Save the new user to the database
    await newUser.save();

    // Send success response
    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    // Handle any errors
    return res.status(500).json({
      success: false,
      message: "Could not create user.",
      error: error.message,
    });
  }
};
export const loginUser=async(req,res)=>{
   const {username,password}=req.body;
    if (!username || !password ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details.",
      });
    }
   try {
      const user =await UserModel.findOne({username:username})
      if(user){
        const validity=await bcrypt.compare(password,user.password)
        validity? res.status(200).json({
             success:true,
             message:"user log in successfull",
             user
        }):res.status(400).json({
             success:false,
             message:"invalid credentials"
        })
      }
      else{
        res.status(404).json({
          success:false,
          message:"user not found"
        })
      }
   } catch (error) {
      res.status(400).json({
        success:false,
        message:error.message,
      }) 
   }

}