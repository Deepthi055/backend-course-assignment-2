
try {
  require('dotenv').config();
} catch (e) {
}

const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://deepthi:mypassword123@cluster0.h0axffh.mongodb.net/?appName=Cluster0";

console.log('MONGODB_URI set in env?', !!process.env.MONGODB_URI);
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');

    const database = client.db('synergy');
    const collections = await database.listCollections({ name: 'events' }).toArray();
    if (collections.length === 0) {
      await database.createCollection('events');
      console.log("Created 'events' collection");
    }
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    throw err;
  }
}

run().catch((err) => console.error(err));

module.exports = { client, run };


const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("dev"));


const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/synergia";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  });


const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  event: { type: String, required: true, trim: true },
  ticketType: { type: String, trim: true, default: "General" },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

let events = [
  {
    title: "Hackathon",
    desc: "Fun event",
    capacity: 50,
    date: new Date("2023-09-15"),
  },
  {
    title: "Treasure Hunt",
    desc: "Adventure game",
    capacity: 30,
    date: new Date("2023-09-20"),
  },
  {
    title: "Tic Tac Toe",
    desc: "Classic game",
    capacity: 20,
    date: new Date("2023-09-25"),
  },
];


app.get("/events", (req, res) => res.status(200).json(events));

app.post("/events", (req, res) => {
  const { title, desc, capacity, date } = req.body;
  if (!title || !desc || !capacity || !date)
    return res.status(400).json({ message: "All event fields are required" });
  events.push({ title, desc, capacity, date: new Date(date) });
  res.status(201).json({ message: "Event added", data: events });
});

app.put("/events", (req, res) => {
  const up = req.body.up;
  const idx = events.findIndex((e) => e.title === up.title);
  if (idx === -1)
    return res.status(404).json({ message: "Event not found for update" });
  events[idx] = up;
  res.status(200).json({ message: "Event updated", data: events[idx] });
});

app.delete("/events", (req, res) => {
  const { title } = req.body;
  events = events.filter((e) => e.title !== title);
  res.status(200).json({ message: "Event deleted", data: events });
});


app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { name, email, event, ticketType } = req.body;
    if (!name || !email || !event) {
      return res.status(400).json({ message: "name, email, and event are required" });
    }
    const booking = new Booking({ name, email, event, ticketType });
    const saved = await booking.save();
    res.status(201).json({ success: true, message: "Booking created", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: "Invalid ID format" });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking updated", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.get("/api/bookings/search", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: "email query parameter required" });
    const results = await Booking.find({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/bookings/filter", async (req, res) => {
  try {
    const { event } = req.query;
    if (!event)
      return res.status(400).json({ message: "event query parameter required" });
    const results = await Booking.find({
      event: { $regex: event, $options: "i" },
    });
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Synergia Event Booking API connected to MongoDB ");
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
