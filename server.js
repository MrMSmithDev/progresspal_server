const app = require("./app");
const connectDB = require("./config/database");
const { connectRedis } = require("./config/cache");
const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    await connectRedis();
    app.listen(PORT, () => console.log(`Server listening on port:${PORT}...`));
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
