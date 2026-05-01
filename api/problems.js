const { getProblems } = require("../server/src/problemParser");

module.exports = async function handler(req, res) {
  try {
    const data = getProblems();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "Failed to load problems",
      details: err.message,
    });
  }
};
