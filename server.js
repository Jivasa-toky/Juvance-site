require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI
,{
  tls: true
});

// Needed to read form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve public folder
app.use(express.static('public'));

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log("Email:", email);
  console.log("Password:", password);

  res.send("Form received");

const server = http.createServer((req, res) => {
    // Normalize URL (remove query params)
    let urlPath = req.url === '/' ? '/index' : req.url;

    // Build file path
    let filePath = path.join(__dirname, 'public', urlPath);

    app.get('/', (req,res) => {
     res.send('Get request to home page');
    })

    let ext = path.extname(filePath);

    // If no extension, assume .html
    if (!ext) {
        filePath += '.html';
        ext = '.html';
    }

    // Set content type
    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

    // Read and serve file
    fs.readFile(filePath, (err, content) => {
        if (err) {
    fs.readFile(path.join(__dirname, 'public', '404.html'), (error404, content404) => {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(error404 ? '404 Page Not Found' : content404);
    })
     } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
app.listen(PORT, () => {
  console.log(`Example app running at http://localhost:${port}`)
});


(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    const db = client.db("juvancebusiness_db_user");
    console.log("✅ Collection 'juvancebusiness_collection created");
   const hashedPassword = await bcrypt.hash(password, 10);
   const existing = await db.collection("juvancebusiness_collection").findOne({ email });
   if (!existing) {
   await db.collection("juvancebusiness_collection").insertOne({email:"juvancejw@gmail.com", password: hashedPassword });
    console.log("✅ Document inserted");
     } else { 
   console.log("⚠️ Document already exists, skipping")
   }
const user = await db.collection("juvancebusiness_collection").findOne({ email });
const isMatch = await bcrypt.compare(password, user.password);
if (isMatch) {
  console.log("✅ Login successful");
} else {
  console.log("❌ Invalid credentials");
}


/*const update = await db.collection("juvancebusines>
  { name: "juvancejw@gmail.com" },              //>
  { $set: { role: "admin" } } // update: what to c>
);

console.log("Matched:", update.matchedCount, "Modi>
/*
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
const result = await db.collection("juvancebusin>
console.log("Deleted count:", result.deletedCount)>*/
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.close();
  }
})();
app.listen(port, () => console.log(`🚀 Server running on ${port}`));
