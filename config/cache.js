const { createClient } = require("redis");

const cache = createClient({
  host: "localhost",
  port: 6379,
});

cache.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

async function connectRedis() {
  try {
    if (!cache.isOpen) {
      await cache.connect();
      console.log("Redis connection successful");
    }
  } catch (err) {
    console.log(`Redis connection failed: ${err.message}`);
  }
}

module.exports = { cache, connectRedis };
