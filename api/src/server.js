const express = require("express");
const { Pool } = require("pg");
const { createClient } = require("redis");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("redis error", err));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/polls", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, question, options, votes FROM polls ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/polls", async (req, res) => {
  const { question, options } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ error: "question and at least 2 options are required" });
  }
  const votes = {};
  options.forEach((_, i) => {
    votes[i] = 0;
  });
  try {
    const result = await pool.query(
      "INSERT INTO polls (question, options, votes) VALUES ($1, $2, $3) RETURNING id, question, options, votes",
      [question, JSON.stringify(options), JSON.stringify(votes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/polls/:id/vote", async (req, res) => {
  const id = Number(req.params.id);
  const option = String(req.body.option);
  try {
    const result = await pool.query(
      `UPDATE polls
         SET votes = jsonb_set(
               votes,
               ARRAY[$2],
               (COALESCE((votes->>$2)::int, 0) + 1)::text::jsonb
             )
       WHERE id = $1
       RETURNING id, question, options, votes`,
      [id, option]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "poll not found" });
    }
    await redis.incr("votes:total");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const total = Number((await redis.get("votes:total")) || 0);
    const aggregated = Number((await redis.get("votes:aggregated")) || 0);
    res.json({ total, aggregated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = Number(process.env.PORT || 3000);

(async () => {
  await redis.connect();
  app.listen(PORT, () => console.log(`api listening on ${PORT}`));
})();
