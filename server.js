const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const emailRoutes = require("./routes/emails");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use("/api", emailRoutes);

app.get("/", (req, res) => {
    res.render("index");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Database configuration:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME
    });
});
