// This is your complete backend server file.
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import 'dotenv/config'; // Make sure this is at the very top of your file

// MongoDB Connection Setup
const password = encodeURIComponent(process.env.MONGO_PASSWORD.trim());
const uri = `mongodb+srv://Tester_db_user:${password}@qacluster.uthpjat.mongodb.net/Tester_db?retryWrites=true&w=majority`;

let conn;
let db;

async function connectToMongo() {
  try {
    const client = new MongoClient(uri);
    conn = await client.connect();
    db = conn.db("Tester_db"); // Store the database connection
    console.log("Connection to MongoDB successful");
  } catch(e) {
    console.error("MongoDB connection failed:", e);
    process.exit(1); // Exit if the connection fails
  }
}

// Express App Setup
const port = 4000;
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Define your routes using the `db` object
app.get('/getUsers', async(req, res) => {
    if (!db) return res.status(503).send("Database not connected.");
    let collection = db.collection("users");
    let results = await collection.find({}).toArray();
    res.status(200).send(results);
});

app.post('/addUser', async (req, res) => {
    if (!db) return res.status(503).send("Database not connected.");
    let collection = db.collection("users");
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);
    res.status(201).send(result);
});

// Start the server after connecting to the database
async function startServer() {
  await connectToMongo();
  app.listen(port, function () {
    console.log("Express server is listening at port: " + port);
  });
}

startServer();