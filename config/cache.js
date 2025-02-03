const { createClient } = require("redis");

const client = createClient({
  host: "localhost",
  port: 6379,
});

client.on("error", (err) => {
  console.error(`Redis error: ${err}`);
});

(async () => {
  await client.connect();
})();

module.exports = client;
