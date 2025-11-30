import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("database connection failed: ", err);
    process.exit(1);
  }
};

export default connectDB;
