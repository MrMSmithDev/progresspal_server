const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@development-progress-pa.9rasp.mongodb.net/?retryWrites=true&w=majority&appName=development-Progress-Pal`;

async function connectDB() {
  await mongoose.connect(mongoDB);
}

module.exports = connectDB;
