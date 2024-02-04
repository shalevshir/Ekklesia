const mongoose = require("mongoose");

const dbName = process.env.DB_NAME
const dbPass = process.env.DB_PASSWORD;

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${dbName}:${dbPass}@ekklesia.xyo4j4r.mongodb.net/?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
