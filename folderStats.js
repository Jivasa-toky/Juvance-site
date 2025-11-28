const fs = require('fs');
const path = require('path');

const folderPath = './public'; // Change this to your folder

// Check if folder exists
if (fs.existsSync(folderPath)) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        console.log(`Stats for files in ${folderPath}:`);
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            fs.stat(filePath, (err, stats) => {
if (err) {
                    console.error(`Error reading stats for ${file}:`, err);
                    return;
                }

                console.log(`\nFile: ${file}`);
                console.log(`Size: ${stats.size} bytes`);
                console.log(`Created: ${stats.birthtime}`);
                console.log(`Modified: ${stats.mtime}`);
                console.log(`Is File: ${stats.isFile()}`);
                console.log(`Is Directory: ${stats.isDirectory()}`);
            });
        });
    });
} else {
    console.log('Folder does not exist!');
}
