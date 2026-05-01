const express = require("express");
const cors = require("cors");
const { getProblems } = require("./problemParser");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/problems", (req, res) => {
  try {
    const data = getProblems();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Failed to load problems",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`DSA API running at http://localhost:${PORT}`);
});
