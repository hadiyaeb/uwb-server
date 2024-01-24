const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// MongoDB Atlas connection
const uri = "mongodb+srv://hadiyaebrahim:Hello123@cluster0.cojugwv.mongodb.net/your_database_name?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a Mongoose schema for your data
const dataSchema = new mongoose.Schema({
  transmitterSerialNumber: String,
  nodeType: String,
  reads: [{
    timeStampUTC: String,
    deviceUID: String,
    manufacturerName: String,
    distance: Number,
    count: Number,
  }],
  allCount: Number,
});

// Create a Mongoose model based on the schema
const DataModel = mongoose.model('Data', dataSchema);

// Middleware to check API key
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.query.apiKey;

  // Check if apiKey is present and has the expected value
  if (!apiKey || apiKey !== 'default-api-key') {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Continue to the next middleware or route handler
  next();
};

// Apply API key middleware to all routes
app.use(apiKeyMiddleware);

// Route to handle the incoming data
app.post('/data', async (req, res) => {
  const data = req.body;

  try {
    // Save the data to MongoDB using the Mongoose model
    const savedData = await DataModel.create(data);
    console.log('Data saved to MongoDB Atlas:', savedData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data to MongoDB Atlas:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});