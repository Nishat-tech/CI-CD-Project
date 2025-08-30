// Add this line at the very top of your file to load environment variables
import 'dotenv/config'; 
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from "mongodb";

// MongoDB Connection Setup
// Make sure MONGO_PASSWORD is set in your .env file
const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
const uri = `mongodb+srv://Tester_db_user:${password}@qacluster.uthpjat.mongodb.net/Tester_db?retryWrites=true&w=majority`;

let db;

async function connectToMongo() {
  try {
    const client = new MongoClient(uri);
    const conn = await client.connect();
    db = conn.db("Tester_db"); // Store the database connection object
    console.log("Connection to MongoDB successful");
  } catch(e) {
    console.error("MongoDB connection failed:", e);
    // Exit the process if the database connection fails
    process.exit(1); 
  }
}

// Express App Setup
const port = 4000;
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// API Routes
app.get('/getUsers', async(req, res) => {
    // Check if the database connection is available before proceeding
    if (!db) {
        return res.status(503).send("Database not connected.");
    }
    try {
        let collection = db.collection("users");
        let results = await collection.find({}).toArray();
        res.status(200).send(results);
    } catch (e) {
        console.error("Error fetching users:", e);
        res.status(500).send("Internal Server Error");
    }
});



// Start the server only after connecting to the database
async function startServer() {
  await connectToMongo();
  app.listen(port, function () {
    console.log("Express server is listening on port: " + port);
  });
}

// Execute the function to start the application
startServer();