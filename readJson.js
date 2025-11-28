const fs = require('fs').promises;
const path = require('path');

// Build path to JSON file in the SAME folder as this script
const jsonPath = path.join(__dirname, 'package.json');

async function readJson() {
  try {
    const text = await fs.readFile(jsonPath, 'utf8'); // Read file as text
    const data = JSON.parse(text); // Convert JSON string to object
    console.log('Parsed JSON:', data);
    console.log('Name:', data.name);
    console.log('Skills:', data.skills);
  } catch (err) {
    console.error('Error reading JSON:', err.message);
  }
}

readJson();
