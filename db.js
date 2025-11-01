require("dotenv").config({ override: true });
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 9000;

// MongoDB client setup
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let eventsCollection;
let bookingsCollection;
// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("synergia");
    eventsCollection = db.collection("events");
    bookingsCollection = db.collection("bookings"); 
    console.log(" MongoDB Connected Successfully!");
  } catch (err) {
    console.error(" MongoDB connection failed:", err);
  }
}
connectDB();

// GET all events
app.get("/events", async (req, res) => {
  try {
    const data = await eventsCollection.find({}).toArray();
    console.log("Fetching events...");
    res.status(200).json(data);
  } catch (err) {
    console.error("Error getting events:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.post("/events", async (req, res) => {
  try {
    const { title, desc, capacity, date } = req.body;

    // Validate input
    if (!title || !desc || !capacity || !date) {
      return res.status(400).json({
        message: "All fields are required: title, desc, capacity, date",
      });
    }

    const newEvent = {
      title,
      desc,
      capacity: Number(capacity),
      date: new Date(date),
    };

   
    const result = await eventsCollection.insertOne(newEvent);

    console.log("Event added:", newEvent);

    
    res.status(201).json({
      message: " Event added successfully!",
      eventId: result.insertedId,
      data: newEvent,
    });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
});
app.put("/put", async (req, res) => {
  try {
    const up = req.body; 
    if (!up.title) {
      return res.status(400).json({ message: "Existing event title required for update" });
    }

    
    const result = await eventsCollection.updateOne(
      { title: up.title },
      { $set: up }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Event not found!" });
    }

    res.status(200).json({ message: " Event updated successfully!" });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get('/events/:id',async (req, res) => {
       try{ 
    const database=client.db('Synergia')
    const eventsCollection=database.collection('events')
    const id=parseInt(req.params.id);
    const data1=await eventsCollection.find({eventId:id}).toArray()
    console.log("Fetching...");
     res.send(data1);
    console.log(data1);
  } catch (err) {
        console.error("Error getting events collection:", err);
    }  
 });
app.get('/event/date/:date',async(req,res)=>{
  try{
    const database=client.db('Synergia')
    const eventsCollection=database.collection('events')
    const id=parseInt(req.params.id);
    const data1=await eventsCollection.find({date:eventdate}).toArray()
    console.log("Fetching...");
     res.send(data1);
    console.log(data1);
  } catch (err) {
        console.error("Error getting events collection:", err);
  }
});
app.delete("/delete", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Event title required for deletion" });
    }

    const result = await eventsCollection.deleteOne({ title });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Event not found!" });
    }

    res.status(200).json({ message: " Event deleted successfully!" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
  const { ObjectId } = require("mongodb");

// DELETE event by ID
app.delete("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id; 

    
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: " Invalid Event ID format" });
    }

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: " Event not found" });
    }

    res.status(200).json({ message: " Event deleted successfully!" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// booking
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await bookingsCollection.find({}).toArray();
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



app.post("/api/bookings", async (req, res) => {
  try {
    const { name, email, eventTitle } = req.body;

    if (!name || !email || !eventTitle) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBooking = {
      name,
      email,
      eventTitle,
      createdAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
      id: result.insertedId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/bookings',async (req, res) => {//Get all bookings
  try{ 
    const database=client.db('Synergia')
    const bookingCollection=database.collection('booking')
    const data1=await bookingCollection.find({}).toArray()
    console.log("Fetching...");
     res.send(data1);
    console.log(data1);
  } catch (err) {
        console.error("Error getting booking collection:", err);
    }  
});
app.get('/api/bookings/:id',async (req, res) => {//Get all bookings
  try{ 
    const database=client.db('Synergia')
    const bookingCollection=database.collection('booking')
    const data1=await bookingCollection.findOne({_id: new ObjectId(id)})
    console.log("Fetching...");
     res.send(data1);
    console.log(data1);
  } catch (err) {
        console.error("Error getting booking collection:", err);
    }  
});
app.get("/api/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id; 

    const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
app.put("/api/bookings", async (req, res) => {
  try {
    const { email, name, eventTitle } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to update booking" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (eventTitle) updateData.eventTitle = eventTitle;

    const result = await bookingsCollection.updateOne(
      { email: email },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found for given email" });
    }

    res.status(200).json({ success: true, message: "Booking updated successfully" });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.delete("/api/bookings", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required to delete booking" });
    }

    const result = await bookingsCollection.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
