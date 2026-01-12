const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { runPriceTracker } = require('./jobs/priceTracker');
const apiRoutes = require('./routes/apiRoutes'); // Adjust path as needed

const app = express();

// --- MIDDLEWARE (CRITICAL) ---
app.use(cors());
// Parses incoming JSON payloads
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use('/api', apiRoutes);

// --- CRON SCHEDULER (Every 1 Minute) ---
cron.schedule('* * * * *', () => {
    console.log("--------------------------------------------------");
    console.log("⏰ 1-Minute Timer Hit: Starting Price Sync Job");
    runPriceTracker();
});

app.get('/', (req, res) => {
  res.send('XO Rig Backend is running');
});

// Use this for local testing or export app for Vercel/tests
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("✅ Background Price Tracker is now ACTIVE");
    });
}

module.exports = app;