const { createClient } = require("redis");

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("redis error", err));

const TICK_MS = Number(process.env.TICK_MS || 5000);

(async () => {
  await redis.connect();
  console.log("worker started");
  setInterval(async () => {
    const total = Number((await redis.get("votes:total")) || 0);
    await redis.set("votes:aggregated", String(total));
    console.log(`aggregated ${total} votes`);
  }, TICK_MS);
})();
