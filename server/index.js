const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// ROOT route (must be BEFORE listen)
app.get("/", (req, res) => {
    res.send("Backend is working");
});

app.get('/health', (req, res) => {
    res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});