require('dotenv').config(); // To load environment variables from a .env file
const express = require('express');
const rbx = require('noblox.js');
const app = express();

// Load sensitive data from environment variables
const groupId = process.env.GROUP_ID; // Group ID
const cookie = process.env.COOKIE; // Account cookie
const apiKey = process.env.API_KEY; // Static API key

// Middleware to serve static files
app.use(express.static("public"));

async function startApp() {
  if (!cookie || !groupId) {
    console.error("Cookie or Group ID is missing!");
    return;
  }
  try {
    await rbx.setCookie(cookie);
    const currentUser = await rbx.getCurrentUser();
    console.log(`Logged in as: ${currentUser.UserName}`);
  } catch (error) {
    console.error("Error logging in:", error);
  }
}
startApp();

// Middleware to validate API key
function validateApiKey(req, res, next) {
  const providedApiKey = req.header('x-api-key'); // Check the 'x-api-key' header for the API key
  if (!providedApiKey || providedApiKey !== apiKey) {
    return res.status(403).json({ error: "Unauthorized access: Invalid API key" });
  }
  next(); // Proceed to the next middleware/route handler if the API key is valid
}

// Rank API with API key validation
app.get("/ranker", validateApiKey, async (req, res) => {
  const userId = parseInt(req.query.userid); // Using query parameters
  const rank = parseInt(req.query.rank);

  if (isNaN(userId) || isNaN(rank)) {
    return res.status(400).json({ error: "Invalid user ID or rank" });
  }

  try {
    await rbx.setRank(groupId, userId, rank);
    res.json({ message: "Rank updated!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update rank", details: error.message });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
