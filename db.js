require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI, {
  tls: true
});

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    const db = client.db("juvancebusiness_db_user");
    console.log("✅ Collection 'juvancebusiness_collection is created");
    const existing = await db.collection("juvancebusiness_collection").findOne({ email: "juvancejw@gmail.com" });
if (!existing) {
  await db.collection("juvancebusiness_collection").insertOne({ email:"juvancejw@gmail.com", password: "juvance.pw" });
  console.log("✅ Document inserted");
} else {
  console.log("⚠️ Document already exists, skipping insert");
}

const doc = await db.collection("juvancebusiness_collection").findOne({email: "juvancejw@gmail.com" });
console.log(doc);
const update = await db.collection("juvancebusiness_collection").updateOne(
  { name: "juvancejw@gmail.com" },              // filter: which document to update
  { $set: { role: "admin" } } // update: what to change
);

console.log("Matched:", update.matchedCount, "Modified:", update.modifiedCount);
/*const result = await db.collection("juvancebusiness_collection").deleteOne({ email: "juvancejw@gmail.com" });
console.log("Deleted count:", result.deletedCount);*/
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.close();
  }
})();

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
