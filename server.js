require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// ✅ Connect to MongoDB once at startup
const client = new MongoClient(process.env.MONGO_URI);
let usersCollection;

async function connectDB() {
  try {
	await client.connect();
    const db = client.db(process.env.DB_NAME);
    usersCollection = db.collection(process.env.COLLECTION_NAME);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
 connectDB();

 // ✅ LOGIN + REGISTER route
  app.post("/login", async (req, res) => {
   const { email, password } = req.body;
   console.log("BODY:", req.body);

   try {
	   // ✅ Check if user exists
	   const existingUser = await usersCollection.findOne({ email });

	    if (!existingUser) {
	  	   // ✅ Register new user
	  	   const hashedPassword = await bcrypt.hash(password, 10);

	  	   await usersCollection.insertOne({
	  	      email,
	  	      password: hashedPassword,
	  	      createdAt: new Date()
	  	   });

	  	  console.log("✅ User registered");
          return res.send("User registered");
	    }

	   // ✅ Compare password
	   const match = await bcrypt.compare(password, existingUser.password);

	   if (!match) {
	  	  console.log("❌ Wrong password");
	  	  return res.send("Wrong password");
	   }

	   console.log("✅ Login successful");
	    return res.send("Login successful");

  } catch (err) {
	  console.error("❌ Error:", err);
	  res.status(500).send("Server error");
  }
 });

// ✅ Start serve
 app.listen(process.env.PORT, () => {
   console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
