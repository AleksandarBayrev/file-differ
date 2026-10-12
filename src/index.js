const { compareDirectories } = require('./compareDirectories.js');

const firstPath = process.argv[2];
const secondPath = process.argv[3];

if (!firstPath || !secondPath) {
    console.error('Usage: node file-differ.mjs <path_to_drive_1> <path_to_drive_2>');
    process.exit(1);
}

const differences = compareDirectories(firstPath, secondPath);

if (differences.length === 0) {
    console.log('\nThe hard drives are identical.');
} else {
    console.log(`\nFound ${differences.length} differences:`);
    differences.forEach(diff => {
        console.log(diff);
    });
}