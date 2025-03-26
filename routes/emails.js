const express = require("express");
const router = express.Router();
const db = require("../db");

// Fetch emails
router.get("/emails", async (req, res) => {
  try {
    const [emails] = await db.query("SELECT * FROM emails");
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle user selection
router.post("/check-email", async (req, res) => {
  const { emailId, userChoice } = req.body;

  try {
    const [rows] = await db.query("SELECT isPhishing FROM emails WHERE id = ?", [emailId]);
    if (rows.length === 0) return res.status(404).json({ error: "Email not found" });

    const isCorrect = rows[0].isPhishing === userChoice;
    res.json({ isCorrect, message: isCorrect ? "Correct!" : "Wrong choice! You've been phished!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
