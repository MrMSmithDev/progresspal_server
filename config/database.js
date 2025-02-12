const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://${process.env.DATABASE_UN}:${process.env.DATABASE_PW}@development-progress-pa.9rasp.mongodb.net/?retryWrites=true&w=majority&appName=development-Progress-Pal`;

async function connectDB() {
  await mongoose.connect(mongoDB);
}

module.exports = connectDB;
