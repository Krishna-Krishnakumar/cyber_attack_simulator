const express = require("express");
const router = express.Router();
const db = require("../db");

// Fetch emails
router.get("/emails", async (req, res) => {
  try {
    console.log("Fetching emails from database...");
    const [emails] = await db.query("SELECT * FROM emails WHERE completed = 0 ORDER BY date DESC");
    console.log("Found emails:", emails);
    res.json(emails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: err.message });
  }
});

// Handle user selection
router.post("/check-email", async (req, res) => {
  const { emailId, userChoice } = req.body;
  console.log("Checking email:", { emailId, userChoice });

  try {
    if (!emailId || userChoice === undefined) {
      console.error("Missing required fields:", { emailId, userChoice });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [rows] = await db.query("SELECT * FROM emails WHERE id = ?", [emailId]);
    console.log("Found email:", rows[0]);
    
    if (rows.length === 0) {
      console.log("Email not found");
      return res.status(404).json({ error: "Email not found" });
    }

    const email = rows[0];
    // Convert both values to numbers for comparison
    const isCorrect = Number(email.isPhishing) === Number(userChoice);
    console.log("Comparison:", { 
      emailIsPhishing: Number(email.isPhishing), 
      userChoice: Number(userChoice), 
      isCorrect 
    });
    
    let message = isCorrect 
      ? "Correct! " + (email.isPhishing 
          ? `This is a phishing email of type "${email.phishing_type}". Red flags: ${email.red_flags}`
          : "This is a legitimate email.")
      : "Wrong choice! " + (email.isPhishing 
          ? "This was actually a phishing email. Red flags: " + email.red_flags
          : "This was actually a legitimate email.");

    // Mark email as completed
    await db.query("UPDATE emails SET completed = 1 WHERE id = ?", [emailId]);

    console.log("Response:", { isCorrect, message, phishingType: email.phishing_type, redFlags: email.red_flags });
    res.json({ 
      isCorrect, 
      message,
      phishingType: email.phishing_type,
      redFlags: email.red_flags
    });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
