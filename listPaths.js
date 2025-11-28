const fs = require('fs');
const path = require('path');

const folderPath = './public'; // relative path to your folder

if (fs.existsSync(folderPath)) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        console.log(`Files in ${folderPath}:`);
        files.forEach(file => {
            const relativePath = path.join(folderPath, file);
            const absolutePath = path.resolve(relativePath);

            console.log(`\nFile: ${file}`);
            console.log(`Relative Path: ${relativePath}`);
            console.log(`Absolute Path: ${absolutePath}`);
        });
 });
} else {
    console.log('Folder does not exist!');
}
