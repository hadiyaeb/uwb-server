const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');

app.use(express.json());

// Replace <username>, <password>, and <dbname> with your MongoDB Atlas username, password, and database name
const uri = "mongodb+srv://hadiyaebrahim:Hello123@cluster0.cojugwv.mongodb.net/?retryWrites=true&w=majority";


async function connectToMongoDB() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let isConnected = false;

    await client.connect();
    isConnected = true;

    const collection = client.db("BLE_Gateway").collection("devices");

    async function handlePostRequest(req, res) {
      try {
        console.log(req.body);

        if (!isConnected) {
          throw new Error("MongoDB client is not connected");
        }

        const { transmitterSerialNumber, nodeType, nodeSerialNumber, reads } = req.body;

        if (!transmitterSerialNumber || !nodeType || !nodeSerialNumber || !reads || !Array.isArray(reads)) {
          throw new Error("Invalid request body format");
        }

        for (const read of reads) {
          const { timeStampUTC, deviceUID, manufacturerName } = read;

          if (!timeStampUTC || !deviceUID || !manufacturerName) {
            console.error("Invalid read information:", read);
            continue; // Skip to the next iteration if the read information is incomplete
          }

          const dataWithTimestamp = {
            transmitterSerialNumber,
            nodeType,
            nodeSerialNumber,
            timeStampUTC,
            deviceUID,
            manufacturerName,
          };

          const result = await collection.insertOne(dataWithTimestamp);
          console.log("1 document inserted");
        }

        res.sendStatus(200);
      } catch (err) {
        console.error("Error inserting documents:", err);
        res.status(500).send("Internal Server Error: " + err.message);
      }
    }

    // ... (existing code for handleGetRequest remains unchanged)

    app.post('/data', handlePostRequest);

    app.listen(8080, () => console.log('Server listening on port 8080'));
  } catch (err) {
    console.error('Failed to initialize MongoDB connection:', err);
  }
}

connectToMongoDB();
