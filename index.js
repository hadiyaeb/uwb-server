const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// Replace <username>, <password>, and <dbname> with your MongoDB Atlas username, password, and database name
const uri = "mongodb+srv://hadiyaebrahim:Hello123@cluster0.cojugwv.mongodb.net/?retryWrites=true&w=majority";

async function connectToMongoDB() {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    let isConnected = false;

    await client.connect();
    isConnected = true;

    const collection = client.db("UWB_Gateway").collection("devices");

    async function handlePostRequest(req, res) {
      try {
        console.log(req.query);

        if (!isConnected) {
          throw new Error("MongoDB client is not connected");
        }

        const {
          transmitterSerialNumber,
          nodeType,
          reads,
          allCount
        } = req.query;

        if (!transmitterSerialNumber || !nodeType || !reads || !allCount) {
          throw new Error("Invalid request query parameters");
        }

        // Convert reads from a string to an array if needed
        const parsedReads = JSON.parse(reads);

        for (const read of parsedReads) {
          const {
            timeStampUTC,
            deviceUID,
            manufacturerName,
            distance,
            count
          } = read;

          if (!timeStampUTC || !deviceUID || !manufacturerName || !distance || !count) {
            console.error("Invalid read information:", read);
            continue;
          }

          const dataWithTimestamp = {
            transmitterSerialNumber,
            nodeType,
            timeStampUTC,
            deviceUID,
            manufacturerName,
            distance,
            count,
          };

          const result = await collection.insertOne(dataWithTimestamp);
          console.log("1 document inserted");
        }

        // Additional data with allCount
        const additionalData = {
          transmitterSerialNumber,
          nodeType,
          allCount
        };

        const result = await collection.insertOne(additionalData);
        console.log("Additional document inserted");

        res.sendStatus(200);
      } catch (err) {
        console.error("Error inserting documents:", err);
        res.status(500).send("Internal Server Error: " + err.message);
      }
    }

    app.post('/data', handlePostRequest);

    app.listen(8080, () => console.log('Server listening on port 8080'));
  } catch (err) {
    console.error('Failed to initialize MongoDB connection:', err);
  }
}

connectToMongoDB();