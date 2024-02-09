import { mongoose } from "@typegoose/typegoose";

const dbName = process.env.DB_NAME
const dbPass = process.env.DB_PASSWORD;
const connectionUri = process.env.NODE_ENV === "production" ?
   `mongodb+srv://${dbName}:${dbPass}@ekklesia.xyo4j4r.mongodb.net/?retryWrites=true&w=majority`:
  `mongodb://localhost:27018`
const connectDB = async () => {
  try {
    await mongoose.connect(connectionUri);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

export { connectDB }
