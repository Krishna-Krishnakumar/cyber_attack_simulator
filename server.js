const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const emailRoutes = require("./routes/emails");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use("/api", emailRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
