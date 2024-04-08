import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.mongo_URL);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

export default dbConnection;
   